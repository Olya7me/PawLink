-- Favorites: authenticated users bookmark animal listings (owner-only RLS).

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  animal_id uuid not null references public.animals (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, animal_id)
);

create index favorites_user_id_created_at_idx
  on public.favorites (user_id, created_at desc);

create index favorites_animal_id_idx
  on public.favorites (animal_id);

-- ---------------------------------------------------------------------------
-- Grants + RLS: own rows only (no anon access)
-- ---------------------------------------------------------------------------

grant select, insert, delete on table public.favorites to authenticated;

alter table public.favorites enable row level security;

create policy "favorites_select_own"
  on public.favorites for select
  to authenticated
  using (user_id = auth.uid());

create policy "favorites_insert_own"
  on public.favorites for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "favorites_delete_own"
  on public.favorites for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Optional empty-state copy for My activity → Favorites (editable in Table Editor)
-- ---------------------------------------------------------------------------

insert into public.app_copy (key, locale, value)
values
  (
    'activity.favoritesEmptyTitle',
    'en',
    'No favorites yet'
  ),
  (
    'activity.favoritesEmptyTitle',
    'ru',
    'Пока нет избранного'
  ),
  (
    'activity.favoritesEmptyBody',
    'en',
    'Tap the heart on a listing in the feed to save it here.'
  ),
  (
    'activity.favoritesEmptyBody',
    'ru',
    'Нажмите сердце на карточке в ленте, чтобы сохранить её здесь.'
  )
on conflict (key, locale) do nothing;
