# PawLink — Architecture

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| App | React Native + Expo (SDK 58) | Cross-platform, EAS path to stores |
| Language | TypeScript strict | Safety for domain rules |
| Navigation | Expo Router | File-based routes, typed routes |
| Backend | Supabase (Postgres + Auth + Storage) | Fast MVP backend with RLS |
| Server state | TanStack Query | Cache, retries, loading/error patterns |
| Client state | Zustand | Small UI prefs (locale, etc.) |
| Forms | React Hook Form + Zod | Validated forms without boilerplate |
| i18n | i18next + react-i18next + expo-localization | ru/en, extensible |
| Tests | Jest + jest-expo + RNTL | Unit / component tests |
| Quality | ESLint (expo) + Prettier | Consistent style |
| CI | GitHub Actions | lint / typecheck / test |

### Intentionally deferred (locked)

| Item | Reason |
|------|--------|
| Maps SDK | MVP uses city text only (approved 2026-11-14) |
| In-app chat | Not in MVP; contact after offer accept |
| Dark mode | Light theme only for MVP |
| Push notifications (Expo Notifications) | Add after in-app notifications work |
| Admin panel | Reports are stored; moderation UI later |
| Nativewind / heavy UI kit | Custom theme tokens keep design control |

## Feature-based layout

```
app/                    # Expo Router routes only (+ colocated *.styles.ts)
src/
  features/             # Domain modules (auth, animals, help, …)
  shared/               # UI primitives, hooks, types, utils
  services/             # External clients (Supabase)
  store/                # Zustand (client prefs)
  theme/                # Design tokens
  i18n/                 # Locales + init
assets/
docs/
supabase/               # Migrations + config skeleton
tests/
```

**Deviation from template:** `@/*` maps to `src/*` (not repo root). Routes stay in top-level `app/` (Expo default). Template `components/` and demo tabs were removed.

### Feature module convention

```
src/features/<name>/
  api/          # Supabase queries / mutations
  components/   # Feature-specific UI (+ colocated ComponentName.styles.ts)
  hooks/
  types/
  schemas/      # Zod
```

Keep routes thin: `app/...` composes feature components.

### Styles & shared UI

- **Do not** keep `StyleSheet.create` in the same file as a component or screen.
- Colocate styles as `ComponentName.styles.ts` next to `ComponentName.tsx` (or `styles.ts` inside a small feature folder when several files share one sheet).
- Route files follow the same rule; under `app/`, prefix style modules with `_` so Expo Router ignores them (e.g. `app/profile.tsx` → `app/_profile.styles.ts`).
- Put reusable presentational pieces in `src/shared/components/` (buttons, inputs, chips, section headers, empty/loading/error states, form screen chrome). Extract only what is duplicated or clearly reusable — avoid a large unused design system.

## State boundaries

- **Server state** (animals, requests, offers, profile from DB) → TanStack Query  
- **Auth session** → Supabase Auth + thin hook (future `features/auth`)  
- **Client prefs** (language override) → Zustand  
- **Form draft state** → React Hook Form  

Do not mirror server lists into Zustand.

## Locked domain rules (2026-11-14)

- Many `help_offers` per `help_request`; **at most one accepted**  
- **Only the help request author** accepts/rejects offers  
- Public location = city + approximate label; meetup/contact **after accept only**  
- Guests may **read** feed + animal detail; auth required to create/respond  
- Photos: ≤5 / animal, ≤5 MB, JPEG/PNG/WebP, compress when possible  
- Account deletion **anonymizes** PII; rescue history remains without personal data  

## UI / UX patterns

- Loading / error / empty states: `LoadingBlock`, `ErrorRetry`, `EmptyState`, `InlineMessage` in `src/shared/components`
- Form screens: prefer `FormScreen` + `ScreenTitle` for title + scroll chrome
- Errors: map Supabase / network errors to i18n keys; never show raw secrets
- Design tokens in `src/theme` — warm neutrals `#F7F3EE`, accent coral `#E07A5F`
- **Light theme only** — `userInterfaceStyle: light` in `app.json`

## Frontend ↔ backend

```
App (Expo)
  → Supabase JS client (anon key)
    → Auth
    → PostgREST (tables) with RLS
    → Storage (animal photos)
```

- Only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in the client  
- Service role key stays on server / CI only (never in the app)  
- RLS must allow **anonymous read** of public listing fields; writes require auth  

## Security

- RLS on every public table  
- Storage: public read for listing photos; authenticated write to own prefix; enforce MIME/size  
- Contact / meetup fields gated so only request author + accepted offerer can read  
- User deletion: anonymize profile and scrub PII; keep historical rows (see DATABASE_SCHEMA)  
- Reports table for abuse (no admin UI in MVP)  

## Navigation model

See [SCREENS.md](./SCREENS.md). High level:

- Root Stack + Expo Router **bottom tabs**: Feed | My activity
- Feed: guest-readable; signed-in users get a profile icon (not a text twin button); filters collapse by default
- My activity: create CTA, author’s listings (edit), offers the user made
- Stack screens: Animal Detail, Edit listing, Create, Profile, Help request / offer, Auth
- Product locks unchanged: light theme, city text (no maps), no chat, one accepted offer (author accepts), meetup/contact after accept only

## Risks

| Risk | Mitigation |
|------|------------|
| Location privacy | City + approximate public fields; contact after accept |
| Premature contact leak | RLS on private contact columns |
| Duplicate / spam listings | Reports storage; rate limits later |
| Coordination conflicts | Single accepted offer per help request |
| Offline | Optimistic UI later; MVP assumes online |

## Repo conventions

- English: PRs, branches, commits, technical docs, code comments  
- Conventional Commits + `.github/pull_request_template.md`  
- UI copy via i18n (ru/en)  
