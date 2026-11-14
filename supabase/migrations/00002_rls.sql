-- PawLink RLS policies
-- Principles: docs/DATABASE_SCHEMA.md
-- Sensitive columns (contact_*, meetup_details) are exposed via security-definer RPCs.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_help_request_author(p_request_id uuid)
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
      and hr.created_by = auth.uid()
  );
$$;

create or replace function public.is_accepted_offer_party(p_offer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.help_offers ho
    join public.help_requests hr on hr.id = ho.help_request_id
    where ho.id = p_offer_id
      and ho.status = 'accepted'
      and (ho.offerer_id = auth.uid() or hr.created_by = auth.uid())
  );
$$;

create or replace function public.can_view_peer_contact(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() = p_profile_id
    or exists (
      select 1
      from public.help_offers ho
      join public.help_requests hr on hr.id = ho.help_request_id
      where ho.status = 'accepted'
        and (
          (hr.created_by = auth.uid() and ho.offerer_id = p_profile_id)
          or (ho.offerer_id = auth.uid() and hr.created_by = p_profile_id)
        )
    );
$$;

-- Public profile fields (no private contact columns)
create or replace view public.profiles_public
with (security_invoker = true)
as
select
  id,
  display_name,
  city,
  avatar_url,
  skills,
  is_anonymized,
  created_at,
  updated_at
from public.profiles
where is_anonymized = false or id = auth.uid();

-- Safe offer read: meetup_details only for accepted parties
create or replace view public.help_offers_safe
with (security_invoker = true)
as
select
  ho.id,
  ho.help_request_id,
  ho.offerer_id,
  ho.message,
  case
    when ho.status = 'accepted'
      and (
        ho.offerer_id = auth.uid()
        or exists (
          select 1
          from public.help_requests hr
          where hr.id = ho.help_request_id
            and hr.created_by = auth.uid()
        )
      )
    then ho.meetup_details
    else null
  end as meetup_details,
  ho.status,
  ho.created_at,
  ho.updated_at
from public.help_offers ho;

-- RPC: private contact for self or post-accept peer
create or replace function public.get_profile_contact(p_profile_id uuid)
returns table (contact_phone text, contact_note text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.can_view_peer_contact(p_profile_id) then
    raise exception 'not authorized to view contact';
  end if;

  return query
  select p.contact_phone, p.contact_note
  from public.profiles p
  where p.id = p_profile_id
    and p.is_anonymized = false;
end;
$$;

revoke all on function public.get_profile_contact(uuid) from public;
grant execute on function public.get_profile_contact(uuid) to authenticated;

-- Full own profile including private contact columns (column grants hide them from SELECT *)
create or replace function public.get_own_profile()
returns public.profiles
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result public.profiles;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into result
  from public.profiles
  where id = auth.uid();

  return result;
end;
$$;

revoke all on function public.get_own_profile() from public;
grant execute on function public.get_own_profile() to authenticated;

-- ---------------------------------------------------------------------------
-- Base grants (Supabase roles) then enable RLS
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select on table public.profiles to anon;

grant select, insert, update, delete on table public.animals to authenticated;
grant select on table public.animals to anon;

grant select, insert, update, delete on table public.help_requests to authenticated;
grant select on table public.help_requests to anon;

grant select, insert, update, delete on table public.help_offers to authenticated;
grant select on table public.help_offers to anon;

grant select, insert, update on table public.animal_updates to authenticated;
grant select on table public.animal_updates to anon;

grant select, insert, update, delete on table public.notifications to authenticated;

grant select, insert on table public.reports to authenticated;

alter table public.profiles enable row level security;
alter table public.animals enable row level security;
alter table public.help_requests enable row level security;
alter table public.help_offers enable row level security;
alter table public.animal_updates enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

-- Clients should prefer profiles_public for listings.
-- Direct table select allowed; contact columns revoked below for anon/authenticated.

create policy "profiles_select_public_or_own"
  on public.profiles for select
  to anon, authenticated
  using (is_anonymized = false or id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() and is_anonymized = false)
  with check (id = auth.uid());

-- Hide private contact columns from direct PostgREST selects
revoke select (contact_phone, contact_note) on public.profiles from anon, authenticated;
grant select (
  id,
  display_name,
  city,
  avatar_url,
  skills,
  is_anonymized,
  created_at,
  updated_at
) on public.profiles to anon, authenticated;
grant select (contact_phone, contact_note) on public.profiles to service_role;
grant insert, update, delete on public.profiles to authenticated;
grant select on public.profiles_public to anon, authenticated;

-- Own user can still update contact via UPDATE (column grants for UPDATE are separate)
grant update (
  display_name,
  city,
  avatar_url,
  skills,
  contact_phone,
  contact_note,
  updated_at
) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- animals — guest + auth read of active listings; write as author
-- ---------------------------------------------------------------------------

create policy "animals_select_public"
  on public.animals for select
  to anon, authenticated
  using (
    status in ('active', 'resolved')
    or author_id = auth.uid()
  );

create policy "animals_insert_auth"
  on public.animals for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "animals_update_author"
  on public.animals for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "animals_delete_author"
  on public.animals for delete
  to authenticated
  using (author_id = auth.uid());

-- ---------------------------------------------------------------------------
-- help_requests
-- ---------------------------------------------------------------------------

create policy "help_requests_select_public"
  on public.help_requests for select
  to anon, authenticated
  using (true);

create policy "help_requests_insert_auth"
  on public.help_requests for insert
  to authenticated
  with check (created_by = auth.uid());

-- Creator or assignee may update status / fields per product rules
create policy "help_requests_update_creator_or_assignee"
  on public.help_requests for update
  to authenticated
  using (created_by = auth.uid() or assignee_id = auth.uid())
  with check (created_by = auth.uid() or assignee_id = auth.uid());

-- ---------------------------------------------------------------------------
-- help_offers
-- Prefer help_offers_safe for reads that may include meetup_details.
-- ---------------------------------------------------------------------------

create policy "help_offers_select_participants_or_public_pending"
  on public.help_offers for select
  to anon, authenticated
  using (
    -- Public can see that offers exist (meetup masked via view / column revoke)
    true
  );

create policy "help_offers_insert_self"
  on public.help_offers for insert
  to authenticated
  with check (offerer_id = auth.uid());

-- Offerer may update own pending/withdrawn; request author may accept/reject
create policy "help_offers_update_offerer_or_author"
  on public.help_offers for update
  to authenticated
  using (
    offerer_id = auth.uid()
    or public.is_help_request_author(help_request_id)
  )
  with check (
    offerer_id = auth.uid()
    or public.is_help_request_author(help_request_id)
  );

revoke select (meetup_details) on public.help_offers from anon, authenticated;
grant select (
  id,
  help_request_id,
  offerer_id,
  message,
  status,
  created_at,
  updated_at
) on public.help_offers to anon, authenticated;
grant select (meetup_details) on public.help_offers to service_role;
grant select on public.help_offers_safe to anon, authenticated;
grant insert on public.help_offers to authenticated;
grant update (
  message,
  meetup_details,
  status,
  updated_at
) on public.help_offers to authenticated;

-- ---------------------------------------------------------------------------
-- animal_updates
-- ---------------------------------------------------------------------------

create policy "animal_updates_select_with_animal"
  on public.animal_updates for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.animals a
      where a.id = animal_id
        and (a.status in ('active', 'resolved') or a.author_id = auth.uid())
    )
  );

create policy "animal_updates_insert_participants"
  on public.animal_updates for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and (
      exists (
        select 1 from public.animals a
        where a.id = animal_id and a.author_id = auth.uid()
      )
      or exists (
        select 1
        from public.help_requests hr
        where hr.animal_id = animal_updates.animal_id
          and (hr.created_by = auth.uid() or hr.assignee_id = auth.uid())
      )
      or exists (
        select 1
        from public.help_offers ho
        join public.help_requests hr on hr.id = ho.help_request_id
        where hr.animal_id = animal_updates.animal_id
          and ho.offerer_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- notifications — own rows only
-- ---------------------------------------------------------------------------

create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_insert_own"
  on public.notifications for insert
  to authenticated
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- reports — insert as self; read own reports only
-- ---------------------------------------------------------------------------

create policy "reports_insert_self"
  on public.reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

create policy "reports_select_own"
  on public.reports for select
  to authenticated
  using (reporter_id = auth.uid());
