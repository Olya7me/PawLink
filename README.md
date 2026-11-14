# PawLink

Mobile app (iOS / Android) for coordinating help for homeless and abandoned animals. Built with **Expo**, **React Native**, **TypeScript**, and **Supabase**.

> Stage 1–3: technical foundation + documentation only. Product screens and business logic are intentionally not implemented yet.

## Docs

- [Product spec](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
- [Screens & flows](docs/SCREENS.md)
- [Development roadmap](docs/DEVELOPMENT_ROADMAP.md)

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
app/                 # Expo Router (minimal shell)
src/features/        # Domain modules (empty placeholders)
src/shared/          # Shared UI / utils / types
src/services/        # Supabase client skeleton
src/store/           # Zustand
src/theme/           # Design tokens
src/i18n/            # en + ru
docs/                # Technical documentation
supabase/            # Migration / config skeleton
tests/               # Jest tests
```

## CI

GitHub Actions runs typecheck, lint, and tests on pushes and PRs to `main`.

## License

See [LICENSE](./LICENSE).
