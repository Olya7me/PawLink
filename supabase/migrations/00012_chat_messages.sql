-- Text chat after an offer is accepted: one thread per help_request.
-- Parties: request author and assignee only. No attachments.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  help_request_id uuid not null references public.help_requests (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  constraint chat_messages_body_len check (char_length(trim(body)) between 1 and 2000)
);

create index chat_messages_request_created_idx
  on public.chat_messages (help_request_id, created_at desc);

alter table public.chat_messages enable row level security;

grant select, insert on table public.chat_messages to authenticated;
revoke update, delete on table public.chat_messages from authenticated;
revoke all on table public.chat_messages from anon;

-- ---------------------------------------------------------------------------
-- Access helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_chat_participant(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.help_requests hr
    where hr.id = p_request_id
      and hr.assignee_id is not null
      and (hr.created_by = auth.uid() or hr.assignee_id = auth.uid())
  );
$$;

create or replace function public.can_send_chat_message(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.help_requests hr
    where hr.id = p_request_id
      and hr.assignee_id is not null
      and hr.status in ('accepted', 'in_progress')
      and (hr.created_by = auth.uid() or hr.assignee_id = auth.uid())
  );
$$;

revoke all on function public.is_chat_participant(uuid) from public;
revoke all on function public.can_send_chat_message(uuid) from public;
grant execute on function public.is_chat_participant(uuid) to authenticated;
grant execute on function public.can_send_chat_message(uuid) to authenticated;

create policy "chat_messages_select_participants"
  on public.chat_messages for select
  to authenticated
  using (public.is_chat_participant(help_request_id));

create policy "chat_messages_insert_participants"
  on public.chat_messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and public.can_send_chat_message(help_request_id)
  );

-- ---------------------------------------------------------------------------
-- Notify the other party (in-app + existing push trigger)
-- ---------------------------------------------------------------------------

insert into public.app_copy (key, locale, value)
values
  ('notifications.chat_message.title', 'en', 'New message'),
  ('notifications.chat_message.title', 'ru', 'Новое сообщение'),
  (
    'notifications.chat_message.body',
    'en',
    '{{preview}}'
  ),
  (
    'notifications.chat_message.body',
    'ru',
    '{{preview}}'
  )
on conflict (key, locale) do update
set value = excluded.value;

create or replace function public.notify_on_chat_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.help_requests;
  v_recipient uuid;
  v_preview text;
begin
  select * into v_request
  from public.help_requests
  where id = new.help_request_id;

  if not found then
    return new;
  end if;

  if new.sender_id = v_request.created_by then
    v_recipient := v_request.assignee_id;
  else
    v_recipient := v_request.created_by;
  end if;

  if v_recipient is null then
    return new;
  end if;

  v_preview := left(trim(new.body), 80);

  perform public.create_notification(
    v_recipient,
    'chat_message',
    'notifications.chat_message.title',
    'notifications.chat_message.body',
    jsonb_build_object(
      'help_request_id', v_request.id,
      'animal_id', v_request.animal_id,
      'chat', true
    ),
    jsonb_build_object('preview', v_preview)
  );

  return new;
end;
$$;

revoke all on function public.notify_on_chat_message() from public;

drop trigger if exists chat_messages_notify_insert on public.chat_messages;
create trigger chat_messages_notify_insert
  after insert on public.chat_messages
  for each row
  execute function public.notify_on_chat_message();

alter publication supabase_realtime add table public.chat_messages;

-- ---------------------------------------------------------------------------
-- Scrub chat bodies on account anonymize
-- ---------------------------------------------------------------------------

create or replace function public.anonymize_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  update public.profiles
  set
    display_name = 'Deleted user',
    city = null,
    avatar_url = null,
    skills = '{}',
    contact_phone = null,
    contact_note = null,
    is_anonymized = true,
    updated_at = now()
  where id = uid
    and is_anonymized = false;

  update public.animal_updates
  set body = '[removed]'
  where author_id = uid
    and event_type = 'comment';

  update public.chat_messages
  set body = '[removed]'
  where sender_id = uid;

  delete from storage.objects
  where bucket_id = 'avatars'
    and (storage.foldername(name))[1] = uid::text;

  delete from public.notifications
  where user_id = uid;

  delete from public.push_tokens
  where user_id = uid;
end;
$$;
