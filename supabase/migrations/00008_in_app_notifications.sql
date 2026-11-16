-- In-app notifications: server-side inserts (triggers + RPC hooks),
-- client may only select / mark own rows read. Titles/bodies from app_copy.

-- ---------------------------------------------------------------------------
-- Harden RLS: no client inserts/deletes (forged notifications)
-- ---------------------------------------------------------------------------

drop policy if exists "notifications_insert_own" on public.notifications;

revoke insert, delete on table public.notifications from authenticated;
grant select, update on table public.notifications to authenticated;

-- ---------------------------------------------------------------------------
-- app_copy helpers + notification insert (security definer)
-- ---------------------------------------------------------------------------

create or replace function public.app_copy_value(p_key text, p_locale text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select value
  from public.app_copy
  where key = p_key
    and locale = p_locale
  limit 1;
$$;

revoke all on function public.app_copy_value(text, text) from public;

create or replace function public.apply_copy_template(
  p_template text,
  p_vars jsonb default '{}'::jsonb
)
returns text
language plpgsql
immutable
as $$
declare
  v_result text := coalesce(p_template, '');
  v_key text;
  v_val text;
begin
  if p_vars is null or p_vars = '{}'::jsonb then
    return v_result;
  end if;

  for v_key, v_val in
    select key, coalesce(value #>> '{}', '')
    from jsonb_each(p_vars)
  loop
    v_result := replace(v_result, '{{' || v_key || '}}', v_val);
  end loop;

  return v_result;
end;
$$;

revoke all on function public.apply_copy_template(text, jsonb) from public;

create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title_key text,
  p_body_key text,
  p_payload jsonb default '{}'::jsonb,
  p_vars jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title_en text;
  v_body_en text;
  v_title_ru text;
  v_body_ru text;
  v_id uuid;
  v_payload jsonb;
begin
  if p_user_id is null then
    return null;
  end if;

  -- Never notify the actor who caused the event
  if auth.uid() is not null and p_user_id = auth.uid() then
    return null;
  end if;

  v_title_en := public.apply_copy_template(
    coalesce(public.app_copy_value(p_title_key, 'en'), p_title_key),
    p_vars
  );
  v_body_en := public.apply_copy_template(
    coalesce(public.app_copy_value(p_body_key, 'en'), ''),
    p_vars
  );
  v_title_ru := public.apply_copy_template(
    coalesce(public.app_copy_value(p_title_key, 'ru'), v_title_en),
    p_vars
  );
  v_body_ru := public.apply_copy_template(
    coalesce(public.app_copy_value(p_body_key, 'ru'), v_body_en),
    p_vars
  );

  v_payload := coalesce(p_payload, '{}'::jsonb)
    || jsonb_build_object(
      'title_key', p_title_key,
      'body_key', p_body_key,
      'vars', coalesce(p_vars, '{}'::jsonb),
      'titles', jsonb_build_object('en', v_title_en, 'ru', v_title_ru),
      'bodies', jsonb_build_object('en', v_body_en, 'ru', v_body_ru)
    );

  insert into public.notifications (user_id, type, title, body, payload)
  values (p_user_id, p_type, v_title_en, nullif(v_body_en, ''), v_payload)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_notification(uuid, text, text, text, jsonb, jsonb) from public;

-- ---------------------------------------------------------------------------
-- Seeds: notification templates + empty-state copy (editable in Table Editor)
-- ---------------------------------------------------------------------------

insert into public.app_copy (key, locale, value)
values
  ('notifications.emptyTitle', 'en', 'No notifications yet'),
  ('notifications.emptyTitle', 'ru', 'Пока нет уведомлений'),
  (
    'notifications.emptyBody',
    'en',
    'You will see updates here when someone offers help or a status changes.'
  ),
  (
    'notifications.emptyBody',
    'ru',
    'Здесь появятся обновления, когда кто-то предложит помощь или изменится статус.'
  ),
  ('notifications.offer_created.title', 'en', 'New offer on your request'),
  ('notifications.offer_created.title', 'ru', 'Новый отклик на ваш запрос'),
  (
    'notifications.offer_created.body',
    'en',
    'Someone offered help on “{{request_title}}”.'
  ),
  (
    'notifications.offer_created.body',
    'ru',
    'Кто-то предложил помощь по запросу «{{request_title}}».'
  ),
  ('notifications.offer_accepted.title', 'en', 'Your offer was accepted'),
  ('notifications.offer_accepted.title', 'ru', 'Ваш отклик приняли'),
  (
    'notifications.offer_accepted.body',
    'en',
    'You were accepted for “{{request_title}}”. Meetup details are now available.'
  ),
  (
    'notifications.offer_accepted.body',
    'ru',
    'Вас приняли на запрос «{{request_title}}». Детали встречи уже доступны.'
  ),
  ('notifications.offer_rejected.title', 'en', 'Your offer was not selected'),
  ('notifications.offer_rejected.title', 'ru', 'Ваш отклик не выбран'),
  (
    'notifications.offer_rejected.body',
    'en',
    'Another helper was chosen for “{{request_title}}”, or the author declined.'
  ),
  (
    'notifications.offer_rejected.body',
    'ru',
    'Для запроса «{{request_title}}» выбрали другого помощника или автор отклонил отклик.'
  ),
  ('notifications.help_request_status.title', 'en', 'Help request updated'),
  ('notifications.help_request_status.title', 'ru', 'Статус запроса обновлён'),
  (
    'notifications.help_request_status.body',
    'en',
    '“{{request_title}}” is now {{status}}.'
  ),
  (
    'notifications.help_request_status.body',
    'ru',
    'Запрос «{{request_title}}» теперь: {{status}}.'
  ),
  ('notifications.animal_status.title', 'en', 'Listing status changed'),
  ('notifications.animal_status.title', 'ru', 'Статус объявления изменён'),
  (
    'notifications.animal_status.body',
    'en',
    '“{{animal_label}}” is now {{status}}.'
  ),
  (
    'notifications.animal_status.body',
    'ru',
    'Объявление «{{animal_label}}» теперь: {{status}}.'
  )
on conflict (key, locale) do nothing;

-- ---------------------------------------------------------------------------
-- Trigger: new pending offer → notify request author
-- ---------------------------------------------------------------------------

create or replace function public.notify_on_help_offer_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.help_requests;
  v_title text;
begin
  if new.status is distinct from 'pending' then
    return new;
  end if;

  select * into v_request
  from public.help_requests
  where id = new.help_request_id;

  if not found or v_request.created_by is null then
    return new;
  end if;

  v_title := coalesce(nullif(trim(v_request.title), ''), 'Help request');

  perform public.create_notification(
    v_request.created_by,
    'offer_created',
    'notifications.offer_created.title',
    'notifications.offer_created.body',
    jsonb_build_object(
      'help_request_id', v_request.id,
      'animal_id', v_request.animal_id,
      'offer_id', new.id
    ),
    jsonb_build_object('request_title', v_title)
  );

  return new;
end;
$$;

drop trigger if exists help_offers_notify_insert on public.help_offers;
create trigger help_offers_notify_insert
  after insert on public.help_offers
  for each row
  execute function public.notify_on_help_offer_insert();

-- ---------------------------------------------------------------------------
-- Trigger: animal status change → notify assignees / accepted offerers
-- ---------------------------------------------------------------------------

create or replace function public.notify_on_animal_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_label text;
  v_uid uuid;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  v_label := coalesce(
    nullif(trim(new.name), ''),
    nullif(trim(new.species::text), ''),
    'Animal'
  );

  for v_uid in
    select distinct recipient_id
    from (
      select hr.assignee_id as recipient_id
      from public.help_requests hr
      where hr.animal_id = new.id
        and hr.assignee_id is not null
      union
      select ho.offerer_id as recipient_id
      from public.help_requests hr
      join public.help_offers ho on ho.help_request_id = hr.id
      where hr.animal_id = new.id
        and ho.status = 'accepted'
        and ho.offerer_id is not null
    ) recipients
    where recipient_id is not null
  loop
    perform public.create_notification(
      v_uid,
      'animal_status',
      'notifications.animal_status.title',
      'notifications.animal_status.body',
      jsonb_build_object(
        'animal_id', new.id,
        'status', new.status::text
      ),
      jsonb_build_object(
        'animal_label', v_label,
        'status', new.status::text
      )
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists animals_notify_status_change on public.animals;
create trigger animals_notify_status_change
  after update of status on public.animals
  for each row
  execute function public.notify_on_animal_status_change();

-- ---------------------------------------------------------------------------
-- Patch accept_help_offer — notify accepted + rejected offerers
-- ---------------------------------------------------------------------------

create or replace function public.accept_help_offer(
  p_offer_id uuid,
  p_meetup_details text default null
)
returns public.help_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer public.help_offers;
  v_request public.help_requests;
  v_meetup text;
  v_title text;
  v_rejected record;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_offer
  from public.help_offers
  where id = p_offer_id
  for update;

  if not found then
    raise exception 'offer not found';
  end if;

  if v_offer.status <> 'pending' then
    raise exception 'offer is not pending';
  end if;

  select * into v_request
  from public.help_requests
  where id = v_offer.help_request_id
  for update;

  if not found then
    raise exception 'help request not found';
  end if;

  if v_request.created_by is distinct from auth.uid() then
    raise exception 'only the help request author can accept offers';
  end if;

  if v_request.status <> 'open' then
    raise exception 'help request is not open';
  end if;

  if v_offer.offerer_id is null then
    raise exception 'offer has no offerer';
  end if;

  v_meetup := coalesce(nullif(trim(p_meetup_details), ''), v_offer.meetup_details);
  v_title := coalesce(nullif(trim(v_request.title), ''), 'Help request');

  for v_rejected in
    select id, offerer_id
    from public.help_offers
    where help_request_id = v_request.id
      and id <> v_offer.id
      and status = 'pending'
  loop
    update public.help_offers
    set status = 'rejected',
        updated_at = now()
    where id = v_rejected.id;

    if v_rejected.offerer_id is not null then
      perform public.create_notification(
        v_rejected.offerer_id,
        'offer_rejected',
        'notifications.offer_rejected.title',
        'notifications.offer_rejected.body',
        jsonb_build_object(
          'help_request_id', v_request.id,
          'animal_id', v_request.animal_id,
          'offer_id', v_rejected.id
        ),
        jsonb_build_object('request_title', v_title)
      );
    end if;
  end loop;

  update public.help_offers
  set status = 'accepted',
      meetup_details = v_meetup,
      updated_at = now()
  where id = v_offer.id
  returning * into v_offer;

  update public.help_requests
  set status = 'accepted',
      assignee_id = v_offer.offerer_id,
      updated_at = now()
  where id = v_request.id;

  perform public.create_notification(
    v_offer.offerer_id,
    'offer_accepted',
    'notifications.offer_accepted.title',
    'notifications.offer_accepted.body',
    jsonb_build_object(
      'help_request_id', v_request.id,
      'animal_id', v_request.animal_id,
      'offer_id', v_offer.id
    ),
    jsonb_build_object('request_title', v_title)
  );

  return v_offer;
end;
$$;

revoke all on function public.accept_help_offer(uuid, text) from public;
grant execute on function public.accept_help_offer(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Patch reject_help_offer — notify offerer
-- ---------------------------------------------------------------------------

create or replace function public.reject_help_offer(p_offer_id uuid)
returns public.help_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer public.help_offers;
  v_request public.help_requests;
  v_title text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_offer
  from public.help_offers
  where id = p_offer_id
  for update;

  if not found then
    raise exception 'offer not found';
  end if;

  if v_offer.status <> 'pending' then
    raise exception 'offer is not pending';
  end if;

  select * into v_request
  from public.help_requests
  where id = v_offer.help_request_id;

  if not found then
    raise exception 'help request not found';
  end if;

  if v_request.created_by is distinct from auth.uid() then
    raise exception 'only the help request author can reject offers';
  end if;

  update public.help_offers
  set status = 'rejected',
      updated_at = now()
  where id = v_offer.id
  returning * into v_offer;

  v_title := coalesce(nullif(trim(v_request.title), ''), 'Help request');

  if v_offer.offerer_id is not null then
    perform public.create_notification(
      v_offer.offerer_id,
      'offer_rejected',
      'notifications.offer_rejected.title',
      'notifications.offer_rejected.body',
      jsonb_build_object(
        'help_request_id', v_request.id,
        'animal_id', v_request.animal_id,
        'offer_id', v_offer.id
      ),
      jsonb_build_object('request_title', v_title)
    );
  end if;

  return v_offer;
end;
$$;

revoke all on function public.reject_help_offer(uuid) from public;
grant execute on function public.reject_help_offer(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Patch set_help_request_status — notify the other party
-- ---------------------------------------------------------------------------

create or replace function public.set_help_request_status(
  p_request_id uuid,
  p_status public.help_request_status
)
returns public.help_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.help_requests;
  v_uid uuid := auth.uid();
  v_title text;
  v_peer uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select * into v_request
  from public.help_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'help request not found';
  end if;

  if v_request.created_by is distinct from v_uid
     and v_request.assignee_id is distinct from v_uid then
    raise exception 'not authorized to update this help request';
  end if;

  if p_status = v_request.status then
    return v_request;
  end if;

  if v_request.status = 'accepted' and p_status = 'in_progress' then
    null;
  elsif v_request.status = 'in_progress' and p_status = 'completed' then
    null;
  elsif v_request.status in ('open', 'accepted', 'in_progress')
        and p_status = 'cancelled'
        and v_request.created_by = v_uid then
    null;
  else
    raise exception 'invalid status transition from % to %', v_request.status, p_status;
  end if;

  update public.help_requests
  set status = p_status,
      updated_at = now()
  where id = v_request.id
  returning * into v_request;

  v_title := coalesce(nullif(trim(v_request.title), ''), 'Help request');

  if v_request.created_by = v_uid then
    v_peer := v_request.assignee_id;
  else
    v_peer := v_request.created_by;
  end if;

  if v_peer is not null then
    perform public.create_notification(
      v_peer,
      'help_request_status',
      'notifications.help_request_status.title',
      'notifications.help_request_status.body',
      jsonb_build_object(
        'help_request_id', v_request.id,
        'animal_id', v_request.animal_id,
        'status', v_request.status::text
      ),
      jsonb_build_object(
        'request_title', v_title,
        'status', v_request.status::text
      )
    );
  end if;

  return v_request;
end;
$$;

revoke all on function public.set_help_request_status(uuid, public.help_request_status) from public;
grant execute on function public.set_help_request_status(uuid, public.help_request_status) to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime (optional): inbox can subscribe to new rows for the signed-in user
-- ---------------------------------------------------------------------------

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then
    null;
  when undefined_object then
    null;
end;
$$;
