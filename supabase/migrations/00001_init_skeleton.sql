-- PawLink schema skeleton (not applied yet).
-- Full design: docs/DATABASE_SCHEMA.md
-- Apply after Supabase project is created and architecture is approved.

-- Enable extensions commonly used with location / UUID
-- create extension if not exists "pgcrypto";

-- Example: profiles linked to auth.users
-- create table public.profiles (
--   id uuid primary key references auth.users (id) on delete cascade,
--   display_name text,
--   city text,
--   avatar_url text,
--   skills text[] default '{}',
--   created_at timestamptz not null default now(),
--   updated_at timestamptz not null default now()
-- );

-- RLS must be enabled on all public tables before launch.
-- alter table public.profiles enable row level security;
