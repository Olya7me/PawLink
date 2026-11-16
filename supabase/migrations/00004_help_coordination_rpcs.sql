-- Help coordination RPCs: atomic accept / reject / withdraw / status updates.
-- Also fix help_offers_safe so meetup_details can be exposed after accept
-- (column SELECT is revoked on the base table; the view must not use security_invoker).

-- ---------------------------------------------------------------------------
-- Safe offer view: owner privileges read base columns; mask meetup_details
-- ---------------------------------------------------------------------------

drop view if exists public.help_offers_safe;

create view public.help_offers_safe
with (security_invoker = false)
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

grant select on public.help_offers_safe to anon, authenticated;

-- ---------------------------------------------------------------------------
-- accept_help_offer — request author only; one accepted offer; reject others
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

  -- Reject other pending offers on this request
  update public.help_offers
  set status = 'rejected',
      updated_at = now()
  where help_request_id = v_request.id
    and id <> v_offer.id
    and status = 'pending';

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

  return v_offer;
end;
$$;

revoke all on function public.accept_help_offer(uuid, text) from public;
grant execute on function public.accept_help_offer(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- reject_help_offer — request author only
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

  return v_offer;
end;
$$;

revoke all on function public.reject_help_offer(uuid) from public;
grant execute on function public.reject_help_offer(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- withdraw_help_offer — offerer only, pending offers
-- ---------------------------------------------------------------------------

create or replace function public.withdraw_help_offer(p_offer_id uuid)
returns public.help_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer public.help_offers;
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

  if v_offer.offerer_id is distinct from auth.uid() then
    raise exception 'only the offerer can withdraw this offer';
  end if;

  if v_offer.status <> 'pending' then
    raise exception 'offer is not pending';
  end if;

  update public.help_offers
  set status = 'withdrawn',
      updated_at = now()
  where id = v_offer.id
  returning * into v_offer;

  return v_offer;
end;
$$;

revoke all on function public.withdraw_help_offer(uuid) from public;
grant execute on function public.withdraw_help_offer(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- set_help_request_status — creator or assignee; allowed transitions only
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

  -- Allowed transitions
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

  return v_request;
end;
$$;

revoke all on function public.set_help_request_status(uuid, public.help_request_status) from public;
grant execute on function public.set_help_request_status(uuid, public.help_request_status) to authenticated;
