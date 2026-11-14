-- PawLink schema: enums, tables, indexes, triggers
-- Design: docs/DATABASE_SCHEMA.md (locked 2026-11-14)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.animal_species as enum ('dog', 'cat', 'other');

create type public.urgency_level as enum ('low', 'medium', 'high', 'critical');

create type public.animal_status as enum ('active', 'resolved', 'archived');

create type public.help_type as enum (
  'catch',
  'transport',
  'vet',
  'foster',
  'permanent_home',
  'food',
  'other'
);

create type public.help_request_status as enum (
  'open',
  'accepted',
  'in_progress',
  'completed',
  'cancelled'
);

create type public.help_offer_status as enum (
  'pending',
  'accepted',
  'rejected',
  'withdrawn'
);

create type public.animal_update_event_type as enum (
  'comment',
  'status_change',
  'photo',
  'system'
);

create type public.report_target_type as enum ('animal', 'profile');

create type public.report_status as enum ('open', 'reviewed', 'dismissed');

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  city text,
  avatar_url text,
  skills text[] not null default '{}',
  contact_phone text,
  contact_note text,
  is_anonymized boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, city)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1)
    ),
    nullif(new.raw_user_meta_data ->> 'city', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- animals
-- ---------------------------------------------------------------------------

create table public.animals (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  name text,
  species public.animal_species not null,
  description text,
  condition_notes text,
  urgency public.urgency_level not null default 'medium',
  status public.animal_status not null default 'active',
  city text not null,
  location_label text,
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint animals_photo_paths_max_5 check (cardinality(photo_paths) <= 5)
);

create index animals_author_id_idx on public.animals (author_id);
create index animals_status_idx on public.animals (status);
create index animals_species_idx on public.animals (species);
create index animals_urgency_idx on public.animals (urgency);
create index animals_city_idx on public.animals (city);

create trigger animals_set_updated_at
  before update on public.animals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- help_requests
-- ---------------------------------------------------------------------------

create table public.help_requests (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,
  help_type public.help_type not null,
  title text not null,
  description text,
  status public.help_request_status not null default 'open',
  assignee_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index help_requests_animal_id_idx on public.help_requests (animal_id);
create index help_requests_status_idx on public.help_requests (status);
create index help_requests_help_type_idx on public.help_requests (help_type);
create index help_requests_assignee_id_idx on public.help_requests (assignee_id);
create index help_requests_created_by_idx on public.help_requests (created_by);

create trigger help_requests_set_updated_at
  before update on public.help_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- help_offers
-- ---------------------------------------------------------------------------

create table public.help_offers (
  id uuid primary key default gen_random_uuid(),
  help_request_id uuid not null references public.help_requests (id) on delete cascade,
  offerer_id uuid references public.profiles (id) on delete set null,
  message text,
  meetup_details text,
  status public.help_offer_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index help_offers_help_request_id_idx on public.help_offers (help_request_id);
create index help_offers_offerer_id_idx on public.help_offers (offerer_id);
create index help_offers_status_idx on public.help_offers (status);

-- At most one pending offer per (request, offerer)
create unique index help_offers_one_pending_per_offerer_idx
  on public.help_offers (help_request_id, offerer_id)
  where status = 'pending';

-- At most one accepted offer per help_request
create unique index help_offers_one_accepted_per_request_idx
  on public.help_offers (help_request_id)
  where status = 'accepted';

create trigger help_offers_set_updated_at
  before update on public.help_offers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- animal_updates (rescue timeline; retained after anonymize)
-- ---------------------------------------------------------------------------

create table public.animal_updates (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  help_request_id uuid references public.help_requests (id) on delete set null,
  body text not null,
  event_type public.animal_update_event_type not null default 'comment',
  created_at timestamptz not null default now()
);

create index animal_updates_animal_id_idx on public.animal_updates (animal_id);
create index animal_updates_author_id_idx on public.animal_updates (author_id);
create index animal_updates_help_request_id_idx on public.animal_updates (help_request_id);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);
create index notifications_read_at_idx on public.notifications (user_id, read_at);

-- ---------------------------------------------------------------------------
-- reports (moderation store; no admin panel in MVP)
-- ---------------------------------------------------------------------------

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now()
);

create index reports_reporter_id_idx on public.reports (reporter_id);
create index reports_target_idx on public.reports (target_type, target_id);
create index reports_status_idx on public.reports (status);
