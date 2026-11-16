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

3. Confirm under **Table Editor** that `profiles`, `animals`, `help_requests`, `help_offers`, `animal_updates`, `notifications`, and `reports` exist.
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

### Already applied 00001–00003?

If your project already ran the first three migrations, run **only** [`00004_help_coordination_rpcs.sql`](../supabase/migrations/00004_help_coordination_rpcs.sql) in the SQL Editor.
