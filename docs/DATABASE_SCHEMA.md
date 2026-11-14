# PawLink — Database Schema

Target: **PostgreSQL via Supabase**. Migrations live under `supabase/migrations/` (skeleton only until architecture approval).

## Entity overview

```
auth.users
    └── profiles (1:1)

profiles ──< animals >── help_requests >── help_offers
              │                  │
              └── animal_updates ┘
              
profiles ──< notifications
profiles ──< reports (as reporter or reported)
```

## Tables

### `profiles`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | FK → `auth.users.id` ON DELETE CASCADE |
| display_name | text | |
| city | text | Public city/area |
| avatar_url | text | Storage path/URL |
| skills | text[] | Soft skills tags |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### `animals`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| author_id | uuid FK → profiles | ON DELETE SET NULL or restrict — **TBD** |
| name | text | optional |
| species | enum/text | dog / cat / other |
| description | text | |
| condition_notes | text | |
| urgency | enum | low / medium / high / critical |
| status | enum | active / resolved / archived |
| location_label | text | Approximate public label |
| location_lat | numeric | Coarse; nullable |
| location_lng | numeric | Coarse; nullable |
| photo_paths | text[] | Storage object paths |
| created_at / updated_at | timestamptz | |

**Privacy:** do not store exact foster/home addresses in public columns. Private meetup details → later private channel or offer message field (decision TBD).

### `help_requests`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| animal_id | uuid FK → animals | ON DELETE CASCADE |
| created_by | uuid FK → profiles | |
| help_type | enum | catch / transport / vet / foster / permanent_home / food / other |
| title | text | short |
| description | text | |
| status | enum | open / accepted / in_progress / completed / cancelled |
| assignee_id | uuid FK → profiles | nullable until accepted |
| created_at / updated_at | timestamptz | |

Indexes: `(animal_id)`, `(status)`, `(help_type)`, `(assignee_id)`.

### `help_offers`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| help_request_id | uuid FK | ON DELETE CASCADE |
| offerer_id | uuid FK → profiles | |
| message | text | |
| status | enum | pending / accepted / rejected / withdrawn |
| created_at / updated_at | timestamptz | |

Unique partial index recommended: one pending offer per `(help_request_id, offerer_id)`.

### `animal_updates`

Timeline / rescue history.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| animal_id | uuid FK | ON DELETE CASCADE |
| author_id | uuid FK → profiles | |
| help_request_id | uuid FK | nullable |
| body | text | |
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

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| reporter_id | uuid FK → profiles | |
| target_type | enum | animal / profile |
| target_id | uuid | |
| reason | text | |
| details | text | |
| status | enum | open / reviewed / dismissed |
| created_at | timestamptz | |

## Auth & RLS (principles)

1. Enable RLS on all `public` tables.  
2. `profiles`: users can read public fields; update only own row.  
3. `animals`: authenticated read of active listings; insert as self; update/delete by author (moderation later).  
4. `help_requests` / `offers`: read for authenticated users; insert offers as self; accept/reject limited to request creator (or assignee rules once approved).  
5. `notifications`: select/update only own rows.  
6. `reports`: insert as self; no public read of others’ reports.

Exact policies to be written in migrations after approval.

## Storage

Bucket suggestion: `animal-photos` (public read, authenticated write to own prefix `user_id/...`).

Avatar bucket: `avatars`.

## User deletion

- `profiles.id` CASCADE from `auth.users`  
- Decide: delete animals vs anonymize author (`author_id` SET NULL) — **needs approval**  
- Storage objects cleanup via Edge Function or cron — later  

## Type generation

After real migrations:

```bash
npx supabase gen types typescript --project-id <id> > src/services/supabase/database.types.ts
```
