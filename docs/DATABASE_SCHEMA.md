# PawLink — Database Schema

Target: **PostgreSQL via Supabase**. Migrations live under `supabase/migrations/` (`00001` schema, `00002` RLS, `00003` storage + anonymize). Apply them in the Supabase SQL Editor or via CLI — see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

Decisions below reflect the **2026-11-14** product lock.

## Entity overview

```
auth.users
    └── profiles (1:1)

profiles ──< animals >── help_requests >── help_offers
              │                  │
              └── animal_updates ┘
              
profiles ──< notifications
profiles ──< reports (as reporter)
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
| type | text | |
| title | text | |
| body | text | |
| payload | jsonb | deep-link ids |
| read_at | timestamptz | nullable |
| created_at | timestamptz | |

### `reports`

Basic moderation store (no admin panel in MVP).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| reporter_id | uuid FK → profiles | ON DELETE SET NULL |
| target_type | enum | animal / profile |
| target_id | uuid | |
| reason | text | |
| details | text | |
| status | enum | open / reviewed / dismissed |
| created_at | timestamptz | |

## Auth & RLS (principles)

1. Enable RLS on all `public` tables.  
2. `profiles`: public read of non-private fields; update only own row; hide contact fields except to self / post-accept peers.  
3. `animals`: **anon + authenticated** read of active public listings; insert/update as authenticated author.  
4. `help_requests`: public read of non-private fields; insert as authenticated; status changes by creator / assignee per rules.  
5. `help_offers`: insert as authenticated self; **accept/reject only by `help_requests.created_by`**; `meetup_details` readable only by request author + accepted offerer after accept.  
6. `animal_updates`: readable with the animal; insert by participants.  
7. `notifications`: select/update only own rows.  
8. `reports`: insert as authenticated self; no public read of others’ reports.

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
