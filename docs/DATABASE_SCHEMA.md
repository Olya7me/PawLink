# PawLink — Database Schema

Target: **PostgreSQL via Supabase**. Migrations live under `supabase/migrations/` (`00001` schema → `00009` feedback/reports). Apply them in the Supabase SQL Editor or via CLI — see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

Decisions below reflect the **2026-11-14** product lock.

## Entity overview

```
auth.users
    └── profiles (1:1)

profiles ──< animals >── help_requests >── help_offers
              │                  │
              └── animal_updates ┘

profiles ──< favorites >── animals
profiles ──< notifications
profiles ──< reports (as reporter)

faq_items (standalone content; public read when published)
lookup_options / app_copy / app_config (public read catalogs + copy + limits)
```

## Tables

### `profiles`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | FK → `auth.users.id` ON DELETE CASCADE |
| display_name | text | Scrubbed / replaced on account deletion |
| city | text | Public city/area |
| avatar_url | text | Storage path/URL; remove on anonymize |
| skills | text[] | Soft skills tags |
| contact_phone | text | nullable; **private** — not shown publicly |
| contact_note | text | nullable; optional Telegram/etc.; **private** |
| is_anonymized | boolean | default false; set true on account deletion |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### `animals`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| author_id | uuid FK → profiles | **ON DELETE SET NULL** (keep listing after anonymize) |
| name | text | optional |
| species | enum/text | dog / cat / other |
| description | text | |
| condition_notes | text | |
| urgency | enum | low / medium / high / critical |
| status | enum | active / resolved / archived |
| city | text | Public city (MVP location; no maps) |
| location_label | text | Approximate public area label |
| photo_paths | text[] | ≤ **5** objects; JPEG/PNG/WebP; ≤ **5 MB** each |
| created_at / updated_at | timestamptz | |

**Privacy:** no precise foster/home addresses in public columns. No map coordinates in MVP.

### `help_requests`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| animal_id | uuid FK → animals | ON DELETE CASCADE |
| created_by | uuid FK → profiles | ON DELETE SET NULL; **only this user** accepts/rejects offers |
| help_type | enum | catch / transport / vet / foster / permanent_home / food / other |
| title | text | short |
| description | text | |
| status | enum | open / accepted / in_progress / completed / cancelled |
| assignee_id | uuid FK → profiles | nullable until an offer is accepted |
| created_at / updated_at | timestamptz | |

Indexes: `(animal_id)`, `(status)`, `(help_type)`, `(assignee_id)`.

**Rule:** many pending offers allowed; **at most one** `help_offers.status = accepted` per request (partial unique index).

### `help_offers`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| help_request_id | uuid FK | ON DELETE CASCADE |
| offerer_id | uuid FK → profiles | ON DELETE SET NULL |
| message | text | public-to-author while pending |
| meetup_details | text | nullable; **visible only after accept** (to author + accepted offerer) |
| status | enum | pending / accepted / rejected / withdrawn |
| created_at / updated_at | timestamptz | |

Unique partial index: one pending offer per `(help_request_id, offerer_id)`.  
Partial unique index: at most one accepted offer per `help_request_id`.

**Coordination RPCs** (migration `00004`): `accept_help_offer`, `reject_help_offer`, `withdraw_help_offer`, `set_help_request_status`. Prefer these over ad-hoc multi-row client updates so accept is atomic (sets assignee, rejects other pending offers, updates request status). Read offers via `help_offers_safe` so `meetup_details` is masked until accept.

### `animal_updates`

Timeline / rescue history (retained after anonymization).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| animal_id | uuid FK | ON DELETE CASCADE |
| author_id | uuid FK → profiles | ON DELETE SET NULL |
| help_request_id | uuid FK | nullable |
| body | text | avoid embedding PII; scrub if needed on delete |
| event_type | text/enum | comment / status_change / photo / system |
| created_at | timestamptz | |

### `notifications`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → profiles | ON DELETE CASCADE |
| type | text | `offer_created` / `offer_accepted` / `offer_rejected` / `help_request_status` / `animal_status` |
| title | text | English fallback resolved from `app_copy` at insert |
| body | text | English fallback; nullable |
| payload | jsonb | `animal_id`, `help_request_id`, `offer_id`, `status`, localized `titles`/`bodies`, `title_key`/`body_key`/`vars` |
| read_at | timestamptz | nullable; client marks read |
| created_at | timestamptz | |

Inserts are **server-side only** (security definer `create_notification` via offer/status RPCs and triggers). Migration: `00008_in_app_notifications.sql`. Clients may SELECT/UPDATE own rows (mark `read_at`); no INSERT/DELETE policies for authenticated.

### `reports`

Unified store for Help-tab **feedback**, **listing reports**, and (schema-ready) **user reports**. No admin panel in MVP — Olga reviews rows in **Table Editor**. Migration: `00009_feedback_and_reports.sql` (evolves the original `00001` shape).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| reporter_id | uuid FK → profiles | ON DELETE SET NULL; **required on insert** (`auth.uid()`); guests must sign in |
| kind | enum | `feedback` / `listing_report` / `user_report` |
| animal_id | uuid FK → animals | nullable; **required** when `kind = listing_report` |
| reported_user_id | uuid FK → profiles | nullable; **required** when `kind = user_report` |
| reason | text | Stable `lookup_options.option_key` for category `report_reason` |
| body | text | Message / comment; required in app for feedback |
| status | enum | `open` (pending review) / `reviewed` / `dismissed`; default `open` |
| created_at | timestamptz | |

Check constraint: feedback has no targets; listing reports require `animal_id`; user reports require `reported_user_id`. Indexes: `(kind)`, `(animal_id)`, `(reported_user_id)`, `(status)`, `(created_at desc)`.

## Auth & RLS (principles)

1. Enable RLS on all `public` tables.  
2. `profiles`: public read of non-private fields; update only own row; hide contact fields except to self / post-accept peers.  
3. `animals`: **anon + authenticated** read of active public listings; insert/update as authenticated author.  
4. `help_requests`: public read of non-private fields; insert as authenticated; status changes by creator / assignee per rules.  
5. `help_offers`: insert as authenticated self; **accept/reject only by `help_requests.created_by`**; `meetup_details` readable only by request author + accepted offerer after accept.  
6. `animal_updates`: readable with the animal; insert by participants.  
7. `notifications`: select/update only own rows; **no client insert/delete** (server triggers/RPCs only).  
8. `reports`: insert as authenticated self (`reporter_id = auth.uid()`); select **own** rows only; no public read of others’ reports; no client update/delete (dashboard / service role for moderation status).
9. `faq_items`: **SELECT** published rows for anon + authenticated; **no client writes** (dashboard / service role only).
10. `lookup_options`: **SELECT** active rows for anon + authenticated; **no client writes**.
11. `app_copy` / `app_config`: **SELECT** all rows for anon + authenticated; **no client writes**.
12. `favorites`: **SELECT / INSERT / DELETE** own rows only (`user_id = auth.uid()`); no anon access; no UPDATE.

### `favorites`

| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid PK (composite) | FK → `profiles.id` ON DELETE CASCADE |
| animal_id | uuid PK (composite) | FK → `animals.id` ON DELETE CASCADE |
| created_at | timestamptz | default now(); list order newest first |

Unique primary key `(user_id, animal_id)`. Indexes: `(user_id, created_at desc)`, `(animal_id)`. Favorited entity is the **animal** (feed cards are animals). Migration: `00007_favorites.sql` (also seeds `app_copy` empty-state keys for Favorites).

### `faq_items`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| slug | text | Stable key pairing en/ru rows; unique with locale |
| locale | text | `en` \| `ru` |
| question / answer | text | Editorial FAQ body (not app i18n chrome) |
| sort_order | int | Ascending display order |
| published | boolean | default true; unpublished hidden by RLS |
| created_at / updated_at | timestamptz | |

### `lookup_options`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| category | text | `species`, `urgency`, `help_type`, `feed_sort`, `animal_status`, `report_reason` |
| option_key | text | Stable key (matches Postgres enum where applicable) |
| locale | text | `en` \| `ru` |
| label | text | Display label |
| sort_order | int | Ascending chip order |
| active | boolean | RLS exposes active rows only |
| created_at / updated_at | timestamptz | |

Unique `(category, option_key, locale)`.

### `app_copy`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| key | text | e.g. `maps.soonTitle`, `animals.feed.emptyBody` |
| locale | text | `en` \| `ru` |
| value | text | Marketing / empty-state body |
| created_at / updated_at | timestamptz | |

Unique `(key, locale)`.

### `app_config`

| Column | Type | Notes |
|--------|------|-------|
| key | text PK | e.g. `max_animal_photos` |
| value | jsonb | Number, string array, etc. |
| description | text | Optional admin note |
| updated_at | timestamptz | |

Public SELECT for all three; no client writes.

## Storage

- Bucket `animal-photos`: public read; authenticated write to own prefix; enforce JPEG/PNG/WebP, ≤5 MB, ≤5 files per animal.  
- Bucket `avatars`: similar constraints.  
- Prefer client-side compression before upload.

## Account deletion (anonymize)

1. Scrub `profiles` PII (`display_name` → generic label, clear avatar/contact/skills, set `is_anonymized`).  
2. Delete or revoke auth credentials / session.  
3. Keep `animals`, `help_requests`, `help_offers`, `animal_updates` with FKs SET NULL or pointing at anonymized profile — **do not cascade-delete rescue history**.  
4. Remove private Storage objects (avatar; optionally keep public animal photos for ongoing cases).  
5. Storage cleanup automation can follow later via Edge Function / cron.

## Type generation

After real migrations:

```bash
npx supabase gen types typescript --project-id <id> > src/services/supabase/database.types.ts
```
