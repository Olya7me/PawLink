-- Remote editable content: lookup catalogs, marketing copy, app config.
-- Public read for anon/authenticated; no client writes (dashboard / service role).

-- ---------------------------------------------------------------------------
-- lookup_options — display labels for stable DB/client enum keys
-- ---------------------------------------------------------------------------

create table public.lookup_options (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  option_key text not null,
  locale text not null check (locale in ('en', 'ru')),
  label text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lookup_options_category_key_locale_unique unique (category, option_key, locale)
);

create index lookup_options_category_locale_active_sort_idx
  on public.lookup_options (category, locale, active, sort_order);

create trigger lookup_options_set_updated_at
  before update on public.lookup_options
  for each row
  execute function public.set_updated_at();

grant select on table public.lookup_options to anon, authenticated;

alter table public.lookup_options enable row level security;

create policy "lookup_options_select_active"
  on public.lookup_options for select
  to anon, authenticated
  using (active = true);

-- ---------------------------------------------------------------------------
-- app_copy — placeholder / empty marketing strings by key + locale
-- ---------------------------------------------------------------------------

create table public.app_copy (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  locale text not null check (locale in ('en', 'ru')),
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_copy_key_locale_unique unique (key, locale)
);

create index app_copy_locale_key_idx on public.app_copy (locale, key);

create trigger app_copy_set_updated_at
  before update on public.app_copy
  for each row
  execute function public.set_updated_at();

grant select on table public.app_copy to anon, authenticated;

alter table public.app_copy enable row level security;

create policy "app_copy_select_all"
  on public.app_copy for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- app_config — key/value app limits and similar flags (locale-independent)
-- ---------------------------------------------------------------------------

create table public.app_config (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);

create trigger app_config_set_updated_at
  before update on public.app_config
  for each row
  execute function public.set_updated_at();

grant select on table public.app_config to anon, authenticated;

alter table public.app_config enable row level security;

create policy "app_config_select_all"
  on public.app_config for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Seeds: species
-- ---------------------------------------------------------------------------

insert into public.lookup_options (category, option_key, locale, label, sort_order, active)
values
  ('species', 'dog', 'en', 'Dog', 10, true),
  ('species', 'dog', 'ru', 'Собака', 10, true),
  ('species', 'cat', 'en', 'Cat', 20, true),
  ('species', 'cat', 'ru', 'Кошка', 20, true),
  ('species', 'other', 'en', 'Other', 30, true),
  ('species', 'other', 'ru', 'Другое', 30, true);

-- ---------------------------------------------------------------------------
-- Seeds: urgency
-- ---------------------------------------------------------------------------

insert into public.lookup_options (category, option_key, locale, label, sort_order, active)
values
  ('urgency', 'low', 'en', 'Low', 10, true),
  ('urgency', 'low', 'ru', 'Низкая', 10, true),
  ('urgency', 'medium', 'en', 'Medium', 20, true),
  ('urgency', 'medium', 'ru', 'Средняя', 20, true),
  ('urgency', 'high', 'en', 'High', 30, true),
  ('urgency', 'high', 'ru', 'Высокая', 30, true),
  ('urgency', 'critical', 'en', 'Critical', 40, true),
  ('urgency', 'critical', 'ru', 'Критическая', 40, true);

-- ---------------------------------------------------------------------------
-- Seeds: help_type
-- ---------------------------------------------------------------------------

insert into public.lookup_options (category, option_key, locale, label, sort_order, active)
values
  ('help_type', 'catch', 'en', 'Catch', 10, true),
  ('help_type', 'catch', 'ru', 'Отлов', 10, true),
  ('help_type', 'transport', 'en', 'Transport', 20, true),
  ('help_type', 'transport', 'ru', 'Транспорт', 20, true),
  ('help_type', 'vet', 'en', 'Vet care', 30, true),
  ('help_type', 'vet', 'ru', 'Ветпомощь', 30, true),
  ('help_type', 'foster', 'en', 'Foster', 40, true),
  ('help_type', 'foster', 'ru', 'Передержка', 40, true),
  ('help_type', 'permanent_home', 'en', 'Permanent home', 50, true),
  ('help_type', 'permanent_home', 'ru', 'Постоянный дом', 50, true),
  ('help_type', 'food', 'en', 'Food', 60, true),
  ('help_type', 'food', 'ru', 'Корм', 60, true),
  ('help_type', 'other', 'en', 'Other', 70, true),
  ('help_type', 'other', 'ru', 'Другое', 70, true);

-- ---------------------------------------------------------------------------
-- Seeds: feed_sort (client-only keys; not a Postgres enum)
-- ---------------------------------------------------------------------------

insert into public.lookup_options (category, option_key, locale, label, sort_order, active)
values
  ('feed_sort', 'newest', 'en', 'Newest', 10, true),
  ('feed_sort', 'newest', 'ru', 'Сначала новые', 10, true),
  ('feed_sort', 'oldest', 'en', 'Oldest', 20, true),
  ('feed_sort', 'oldest', 'ru', 'Сначала старые', 20, true),
  ('feed_sort', 'urgency', 'en', 'Urgency', 30, true),
  ('feed_sort', 'urgency', 'ru', 'По срочности', 30, true);

-- ---------------------------------------------------------------------------
-- Seeds: animal_status (edit form labels)
-- ---------------------------------------------------------------------------

insert into public.lookup_options (category, option_key, locale, label, sort_order, active)
values
  ('animal_status', 'active', 'en', 'Active', 10, true),
  ('animal_status', 'active', 'ru', 'Активно', 10, true),
  ('animal_status', 'resolved', 'en', 'Resolved', 20, true),
  ('animal_status', 'resolved', 'ru', 'Решено', 20, true),
  ('animal_status', 'archived', 'en', 'Archived', 30, true),
  ('animal_status', 'archived', 'ru', 'В архиве', 30, true);

-- ---------------------------------------------------------------------------
-- Seeds: app_copy (marketing / empty-state content)
-- ---------------------------------------------------------------------------

insert into public.app_copy (key, locale, value)
values
  ('maps.soonTitle', 'en', 'Maps coming soon'),
  ('maps.soonTitle', 'ru', 'Карты скоро'),
  (
    'maps.soonBody',
    'en',
    'Listings use city as text in this MVP. A map view will land in a later release.'
  ),
  (
    'maps.soonBody',
    'ru',
    'В этом MVP объявления используют город текстом. Карта появится в следующих версиях.'
  ),
  ('animals.feed.emptyTitle', 'en', 'No listings yet'),
  ('animals.feed.emptyTitle', 'ru', 'Пока нет объявлений'),
  (
    'animals.feed.emptyBody',
    'en',
    'Try clearing filters, or create the first listing from My activity.'
  ),
  (
    'animals.feed.emptyBody',
    'ru',
    'Сбросьте фильтры или создайте первое объявление во вкладке «Моё».'
  ),
  ('activity.listingsEmptyTitle', 'en', 'No publications yet'),
  ('activity.listingsEmptyTitle', 'ru', 'Пока нет объявлений'),
  (
    'activity.listingsEmptyBody',
    'en',
    'Create a publication to ask for help with an animal.'
  ),
  (
    'activity.listingsEmptyBody',
    'ru',
    'Создайте объявление, чтобы попросить помощь животному.'
  ),
  ('activity.offersEmptyTitle', 'en', 'No offers yet'),
  ('activity.offersEmptyTitle', 'ru', 'Пока нет откликов'),
  (
    'activity.offersEmptyBody',
    'en',
    'Browse the feed and offer help on an open request.'
  ),
  (
    'activity.offersEmptyBody',
    'ru',
    'Откройте ленту и предложите помощь по открытому запросу.'
  );

-- ---------------------------------------------------------------------------
-- Seeds: app_config
-- ---------------------------------------------------------------------------

insert into public.app_config (key, value, description)
values
  (
    'max_animal_photos',
    '5'::jsonb,
    'Maximum photos per animal listing (client validation; DB check still ≤5)'
  ),
  (
    'max_photo_bytes',
    '5242880'::jsonb,
    'Maximum photo size in bytes (5 MB)'
  ),
  (
    'allowed_photo_mime_types',
    '["image/jpeg", "image/jpg", "image/png", "image/webp"]'::jsonb,
    'Allowed MIME types for animal photos'
  );
