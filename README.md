# PawLink

Mobile app (iOS / Android) for coordinating help for homeless and abandoned animals. Built with **Expo**, **React Native**, **TypeScript**, and **Supabase**.

Guests can browse the feed, listing detail, Help, and the **Map** tab. Sign-in is required to create listings, offers, and reports. Apply SQL via [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) (include `00010_animal_public_location.sql` for map pins).

## Docs

- [Product spec](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
- [Screens & flows](docs/SCREENS.md)
- [Development roadmap](docs/DEVELOPMENT_ROADMAP.md)
- [Supabase setup](docs/SUPABASE_SETUP.md)

## Requirements

- Node.js 22+
- npm
- Android emulator or a device (MapLibre is native code; Expo Go cannot show the map)
- Optional: iOS simulator (Mac + Xcode)

## Setup

```bash
git clone https://github.com/Olya7me/PawLink.git
cd PawLink
npm install
cp .env.example .env
```

Fill `.env` with your Supabase **URL** and **anon** key (never use the service role key in the app). Auth uses **Supabase Email**, not Google.

## Run

Feed, auth, and listing forms work after `npm start`. The **Map** tab needs a **development build** because it uses MapLibre (OpenStreetMap tiles via OpenFreeMap — no Google Maps API key).

```bash
# Android emulator (DNS helps some Mac setups)
emulator -avd Pixel_7 -dns-server 8.8.8.8 -no-snapshot-load

# First time, or after adding native libs:
npx expo run:android
# Mac:
npx expo run:ios

# Later JS-only work:
npm start
```

Web (`npm run web`) has no interactive map.

## Location and map

- Create / edit listing: search-and-select **city**, then **district**, optional **street / landmark**. Free-text is not saved; Nominatim (OpenStreetMap) provides suggestions.
- Coordinates stored on `animals` are the most specific **public** place the author chose. Contact and meetup stay on accepted offers only.
- Map tab: active listings with coordinates, same filter panel as the feed, marker → listing card → Animal Detail.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` / `ios` / `web` | Platform targets |
| `npx expo run:android` / `ios` | Native development build (required for Map) |
| `npm run typecheck` | TypeScript `--noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm test` | Jest |

## Project structure

```
app/                 # Expo Router (auth + home shell)
src/features/        # Domain modules (auth, profile, …)
src/shared/          # Shared UI / utils / types
src/services/        # Supabase client skeleton
src/store/           # Zustand
src/theme/           # Design tokens
src/i18n/            # en + ru
docs/                # Technical documentation
supabase/            # Migration / config skeleton
tests/               # Jest tests
```

## Conventions

- **English** for PR titles/descriptions, branch names, commit messages, technical docs, and code comments.
- **Conventional Commits** (e.g. `feat:`, `fix:`, `docs:`, `chore:`).
- Branch names should look author-owned (e.g. `chore/expo-foundation`, `feat/auth`); do not use agent/tooling prefixes in branch names.
- Use the [pull request template](.github/pull_request_template.md).
- App UI strings may be Russian and English via i18n.

## Locked product decisions (2026-11-14)

See [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) for the full table (single accepted offer, author-only accept/reject, anonymize on delete, guest feed, photo limits, listing reports and Help feedback, no chat and no admin console). **Public map location** is in the app: city + district required, street optional, coordinates of the chosen public place. Dark theme is in Profile. No store release planned.

## CI

GitHub Actions runs typecheck, lint, and tests on pushes and PRs to `main`.

## License

See [LICENSE](./LICENSE).
