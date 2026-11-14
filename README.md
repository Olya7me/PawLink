# PawLink

Mobile app (iOS / Android) for coordinating help for homeless and abandoned animals. Built with **Expo**, **React Native**, **TypeScript**, and **Supabase**.

> Auth + database schema/RLS MVP. Apply SQL via [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). Feed and create-animal UI come next.

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
- Expo Go (optional, for device preview)

## Setup

```bash
git clone https://github.com/Olya7me/PawLink.git
cd PawLink
npm install
cp .env.example .env
```

Fill `.env` with your Supabase **URL** and **anon** key (never use the service role key in the app).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` / `ios` / `web` | Platform targets |
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

See [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) for the full table (single accepted offer, author-only accept/reject, anonymize on delete, guest feed, photo limits, no maps/chat/dark mode in MVP, basic reports).

## CI

GitHub Actions runs typecheck, lint, and tests on pushes and PRs to `main`.

## License

See [LICENSE](./LICENSE).
