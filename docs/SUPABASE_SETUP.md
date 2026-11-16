# Supabase setup (Auth + schema)

Apply the SQL migrations in this repository to your Supabase project, then put **public** keys in local `.env` (never commit secrets).

## 1. Create project keys locally

```bash
cp .env.example .env
```

Set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Use the **anon** key only. Do not put the service role key in the app or in git.

## 2. Apply migrations (pick one)

### Option A — Supabase SQL Editor (recommended for MVP)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run the migration files **in order**, each as a separate query (or paste them one after another in one run):

| Order | File |
|------:|------|
| 1 | [`supabase/migrations/00001_schema.sql`](../supabase/migrations/00001_schema.sql) |
| 2 | [`supabase/migrations/00002_rls.sql`](../supabase/migrations/00002_rls.sql) |
| 3 | [`supabase/migrations/00003_storage_and_anonymize.sql`](../supabase/migrations/00003_storage_and_anonymize.sql) |
| 4 | [`supabase/migrations/00004_help_coordination_rpcs.sql`](../supabase/migrations/00004_help_coordination_rpcs.sql) — required for accept/reject/withdraw offers and status transitions |
| 5 | [`supabase/migrations/00005_faq_items.sql`](../supabase/migrations/00005_faq_items.sql) — Help FAQ table, RLS, and seed rows |

3. Confirm under **Table Editor** that `profiles`, `animals`, `help_requests`, `help_offers`, `animal_updates`, `notifications`, `reports`, and `faq_items` exist.
4. Confirm under **Storage** that buckets `animal-photos` and `avatars` exist.

### Option B — Supabase CLI (if the project is linked)

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

## 3. Auth settings

In **Authentication → Providers**, keep Email enabled.

In **Authentication → URL configuration**, add your Expo redirect URL(s) used for password reset (for example the URL from `expo-linking` / your app scheme) so recovery links open the app’s reset screen.

Optional for local testing: disable “Confirm email” so sign-up returns a session immediately.

## 4. Regenerate types (optional)

After the remote schema matches migrations:

```bash
npx supabase gen types typescript --project-id <id> > src/services/supabase/database.types.ts
```

The repo already includes hand-written types aligned with these migrations.

## What the migrations include

- Tables, enums, FKs, indexes (including one accepted offer per help request)
- Profile auto-create trigger on `auth.users` insert
- RLS for guest read / auth write rules
- Column protection for `contact_*` and `meetup_details` (RPC / safe views)
- Storage buckets + size/MIME limits
- `anonymize_account()` for account deletion
- Help coordination RPCs (`accept_help_offer`, `reject_help_offer`, `withdraw_help_offer`, `set_help_request_status`) and a fixed `help_offers_safe` view
- `faq_items` table (published FAQ for the Help tab), public SELECT of published rows only, seed Q&A in en/ru

### Already applied earlier migrations?

| If you already ran… | Run next in SQL Editor |
|---------------------|------------------------|
| 00001–00003 only | [`00004_help_coordination_rpcs.sql`](../supabase/migrations/00004_help_coordination_rpcs.sql), then [`00005_faq_items.sql`](../supabase/migrations/00005_faq_items.sql) |
| 00001–00004 | **Only** [`00005_faq_items.sql`](../supabase/migrations/00005_faq_items.sql) |

### Edit FAQ content (Table Editor)

1. Open **Table Editor** → `faq_items`.
2. Each row is one Q&A for one locale (`en` or `ru`). Pair locales with the same `slug`.
3. Edit `question` / `answer` text; use `sort_order` for display order (lower first).
4. Set `published` to `false` to hide a row from the app (RLS only exposes published rows to anon/authenticated).
5. Add a new pair of rows (en + ru) when adding a topic; keep `slug` stable across locales.
6. Client apps cannot insert/update/delete FAQ rows — use the dashboard (service role). No in-app admin UI yet.
