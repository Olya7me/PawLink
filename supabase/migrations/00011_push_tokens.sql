-- Device push tokens and delivery through the Expo Push API (pg_net).
-- Titles follow the locale stored with the token (payload.titles / payload.bodies).

create extension if not exists pg_net;

create table public.push_tokens (
  token text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  locale text not null default 'en' check (locale in ('en', 'ru')),
  updated_at timestamptz not null default now()
);

create index push_tokens_user_id_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

grant select, insert, update, delete on table public.push_tokens to authenticated;

create policy "push_tokens_select_own"
  on public.push_tokens for select
  to authenticated
  using (user_id = auth.uid());

create policy "push_tokens_insert_own"
  on public.push_tokens for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "push_tokens_update_own"
  on public.push_tokens for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "push_tokens_delete_own"
  on public.push_tokens for delete
  to authenticated
  using (user_id = auth.uid());

create or replace function public.dispatch_notification_push()
returns trigger
language plpgsql
security definer
set search_path = public, net
as $$
declare
  v_row record;
  v_title text;
  v_body text;
begin
  for v_row in
    select token, locale
    from public.push_tokens
    where user_id = new.user_id
  loop
    v_title := coalesce(new.payload -> 'titles' ->> v_row.locale, new.title);
    v_body := coalesce(new.payload -> 'bodies' ->> v_row.locale, new.body, '');

    perform net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      body := jsonb_build_object(
        'to', v_row.token,
        'title', v_title,
        'body', v_body,
        'sound', 'default',
        'channelId', 'default',
        'data', jsonb_build_object(
          'notificationId', new.id,
          'help_request_id', new.payload ->> 'help_request_id',
          'animal_id', new.payload ->> 'animal_id'
        )
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Accept', 'application/json'
      )
    );
  end loop;

  return new;
end;
$$;

revoke all on function public.dispatch_notification_push() from public;

create trigger notifications_dispatch_push
  after insert on public.notifications
  for each row
  execute function public.dispatch_notification_push();

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

  delete from storage.objects
  where bucket_id = 'avatars'
    and (storage.foldername(name))[1] = uid::text;

  delete from public.notifications
  where user_id = uid;

  delete from public.push_tokens
  where user_id = uid;
end;
$$;
