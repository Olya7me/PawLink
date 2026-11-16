-- Feedback + listing reports: evolve `reports` for feedback / listing / user kinds,
-- seed report_reason lookup labels, keep auth-only insert + own-row read.

-- ---------------------------------------------------------------------------
-- Enum: report kind (feedback | listing_report | user_report)
-- ---------------------------------------------------------------------------

create type public.report_kind as enum ('feedback', 'listing_report', 'user_report');

-- ---------------------------------------------------------------------------
-- Evolve reports columns (target_type/target_id → kind + typed FKs + body)
-- ---------------------------------------------------------------------------

alter table public.reports
  add column kind public.report_kind,
  add column animal_id uuid references public.animals (id) on delete set null,
  add column reported_user_id uuid references public.profiles (id) on delete set null,
  add column body text;

-- Backfill any pre-existing rows from the original moderation shape
update public.reports
set
  kind = case
    when target_type = 'animal' then 'listing_report'::public.report_kind
    else 'user_report'::public.report_kind
  end,
  animal_id = case when target_type = 'animal' then target_id else null end,
  reported_user_id = case when target_type = 'profile' then target_id else null end,
  body = details
where kind is null;

alter table public.reports
  alter column kind set not null;

alter table public.reports
  drop column target_type,
  drop column target_id,
  drop column details;

alter table public.reports
  drop constraint if exists reports_kind_targets_check;

alter table public.reports
  add constraint reports_kind_targets_check check (
    (
      kind = 'feedback'
      and animal_id is null
      and reported_user_id is null
    )
    or (
      kind = 'listing_report'
      and animal_id is not null
      and reported_user_id is null
    )
    or (
      kind = 'user_report'
      and reported_user_id is not null
    )
  );

create index reports_kind_idx on public.reports (kind);
create index reports_animal_id_idx on public.reports (animal_id);
create index reports_reported_user_id_idx on public.reports (reported_user_id);
create index reports_created_at_idx on public.reports (created_at desc);

-- Drop unused enum left from 00001 (no longer referenced)
drop type if exists public.report_target_type;

-- ---------------------------------------------------------------------------
-- RLS remains: authenticated insert as self; select own rows only
-- (policies from 00002 still apply to reporter_id)
-- ---------------------------------------------------------------------------

-- Ensure grants stay explicit after column rewrite
grant select, insert on table public.reports to authenticated;

-- ---------------------------------------------------------------------------
-- Seeds: report_reason (editable labels; option_key stored on reports.reason)
-- ---------------------------------------------------------------------------

insert into public.lookup_options (category, option_key, locale, label, sort_order, active)
values
  ('report_reason', 'spam', 'en', 'Spam or advertising', 10, true),
  ('report_reason', 'spam', 'ru', 'Спам или реклама', 10, true),
  ('report_reason', 'inappropriate', 'en', 'Inappropriate content', 20, true),
  ('report_reason', 'inappropriate', 'ru', 'Неприемлемый контент', 20, true),
  ('report_reason', 'misleading', 'en', 'Misleading or false', 30, true),
  ('report_reason', 'misleading', 'ru', 'Вводит в заблуждение', 30, true),
  ('report_reason', 'animal_welfare', 'en', 'Animal welfare concern', 40, true),
  ('report_reason', 'animal_welfare', 'ru', 'Беспокойство о животном', 40, true),
  ('report_reason', 'other', 'en', 'Other', 50, true),
  ('report_reason', 'other', 'ru', 'Другое', 50, true)
on conflict (category, option_key, locale) do nothing;

-- ---------------------------------------------------------------------------
-- Optional copy for feedback empty/hint (editable without a release)
-- ---------------------------------------------------------------------------

insert into public.app_copy (key, locale, value)
values
  (
    'reports.feedback.hint',
    'en',
    'Tell us what went wrong or how we can improve. We read every message in the dashboard.'
  ),
  (
    'reports.feedback.hint',
    'ru',
    'Напишите, что пошло не так или как нам стать лучше. Мы читаем каждое сообщение в панели.'
  ),
  (
    'reports.listing.hint',
    'en',
    'Choose a reason and add details if needed. Reports help us keep listings safe.'
  ),
  (
    'reports.listing.hint',
    'ru',
    'Выберите причину и при необходимости добавьте детали. Жалобы помогают держать ленту безопасной.'
  )
on conflict (key, locale) do nothing;
