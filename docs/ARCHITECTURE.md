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

### Intentionally deferred

| Item | Reason |
|------|--------|
| Push notifications (Expo Notifications) | Architecture only for MVP; add when in-app notifications work |
| Maps SDK | Approximate location first; exact map UX needs product decision |
| Nativewind / heavy UI kit | Custom minimal theme tokens keep design control for MVP |

## Feature-based layout

```
app/                    # Expo Router routes only
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

**Deviation from template:** `@/*` maps to `src/*` (not repo root). Routes stay in top-level `app/` (Expo default). Template `components/` and demo tabs were removed — no product screens yet.

### Feature module convention (when implementing)

```
src/features/<name>/
  api/          # Supabase queries / mutations
  components/   # Feature-specific UI
  hooks/
  types/
  schemas/      # Zod
```

Keep routes thin: `app/...` composes feature components.

## State boundaries

- **Server state** (animals, requests, offers, profile from DB) → TanStack Query  
- **Auth session** → Supabase Auth + thin hook (future `features/auth`)  
- **Client prefs** (language override) → Zustand  
- **Form draft state** → React Hook Form  

Do not mirror server lists into Zustand.

## UI / UX patterns

Documented patterns for later screens:

- Loading / error / empty states in `shared/components` (to be added with first feature)
- Errors: map Supabase / network errors to i18n keys; never show raw secrets
- Design tokens in `src/theme` — warm neutrals `#F7F3EE`, accent coral `#E07A5F`
- **Light theme only for MVP** — dark mode deferred (avoids doubling QA). `userInterfaceStyle: light` in `app.json`

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
- Public location fields must be approximate (city / area / coarse coords) — never publish private foster addresses  

## Security

- RLS on every public table  
- Storage policies scoped to owner / public-read for listing photos as designed  
- User deletion: cascade from `auth.users` → `profiles` and related content policy (see DATABASE_SCHEMA)  
- Reports table for abuse  

## Navigation model (planned)

See [SCREENS.md](./SCREENS.md). High level:

- Auth stack (unauthenticated)
- Main tabs: Feed | Create | My tasks | Profile
- Stacks for animal detail, help request, offers, settings

## Risks

| Risk | Mitigation |
|------|------------|
| Location privacy | Coarse public location; private details only after accept |
| Duplicate / spam listings | Reports + rate limits later |
| Coordination conflicts | One active assignee per help request (MVP) |
| Offline | Optimistic UI later; MVP assumes online |
| Scope creep | Stages 1–3 stop at foundation + docs |

## Decisions needing approval

Listed in [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md).
