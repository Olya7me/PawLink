-- FAQ content for the Help tab (public read of published rows; edits via dashboard / service role).

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null check (locale in ('en', 'ru')),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint faq_items_slug_locale_unique unique (slug, locale)
);

create index faq_items_locale_published_sort_idx
  on public.faq_items (locale, published, sort_order);

create trigger faq_items_set_updated_at
  before update on public.faq_items
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: anon/authenticated may SELECT published rows only; no client writes
-- ---------------------------------------------------------------------------

grant select on table public.faq_items to anon, authenticated;
-- intentionally no insert/update/delete grants for anon or authenticated
-- service_role bypasses RLS and retains full access for dashboard / admin edits

alter table public.faq_items enable row level security;

create policy "faq_items_select_published"
  on public.faq_items for select
  to anon, authenticated
  using (published = true);

-- ---------------------------------------------------------------------------
-- Seed: current hardcoded Help FAQ (en + ru)
-- ---------------------------------------------------------------------------

insert into public.faq_items (slug, locale, question, answer, sort_order, published)
values
  (
    'guestBrowse',
    'en',
    'Can I browse without an account?',
    'Yes. Guests can open the feed and animal details. Sign in when you want to create a listing or offer help.',
    10,
    true
  ),
  (
    'guestBrowse',
    'ru',
    'Можно смотреть без аккаунта?',
    'Да. Гости открывают ленту и карточки животных. Войдите, чтобы создать объявление или предложить помощь.',
    10,
    true
  ),
  (
    'createListing',
    'en',
    'How do I publish a listing?',
    'Sign in, open My activity, then Create publication. Add photos, city, description, and the help types you need.',
    20,
    true
  ),
  (
    'createListing',
    'ru',
    'Как опубликовать объявление?',
    'Войдите, откройте «Моё» и нажмите «Создать объявление». Добавьте фото, город, описание и типы нужной помощи.',
    20,
    true
  ),
  (
    'offerHelp',
    'en',
    'How do I offer help?',
    'Open a listing, choose an open help request, and send a short message. Meetup and contact details stay private until the author accepts.',
    30,
    true
  ),
  (
    'offerHelp',
    'ru',
    'Как предложить помощь?',
    'Откройте объявление, выберите открытый запрос и отправьте короткое сообщение. Контакты и место встречи скрыты, пока автор не примет отклик.',
    30,
    true
  ),
  (
    'acceptOffer',
    'en',
    'What happens when an offer is accepted?',
    'The author can accept one offer per request. After accept, both parties see private meetup and contact notes to coordinate.',
    40,
    true
  ),
  (
    'acceptOffer',
    'ru',
    'Что происходит после принятия отклика?',
    'Автор может принять один отклик на запрос. После принятия обе стороны видят приватные заметки о встрече и контактах.',
    40,
    true
  ),
  (
    'cityOnly',
    'en',
    'Why is location only a city?',
    'MVP uses city text only — no map picker. Share a district or landmark in the approximate area field, never a private address.',
    50,
    true
  ),
  (
    'cityOnly',
    'ru',
    'Почему указан только город?',
    'В MVP локация — текст города, без карты. В поле района укажите ориентир, но не частный адрес.',
    50,
    true
  ),
  (
    'privacy',
    'en',
    'Who sees my phone or Telegram?',
    'Private contact fields on your profile stay hidden until an offer is accepted. Guests and other helpers cannot see them before that.',
    60,
    true
  ),
  (
    'privacy',
    'ru',
    'Кто видит мой телефон или Telegram?',
    'Приватные контакты в профиле скрыты, пока отклик не принят. Гости и другие помощники их не видят раньше.',
    60,
    true
  );
