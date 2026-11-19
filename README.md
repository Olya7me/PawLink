# PawLink

Mobile app for coordinating help for homeless and abandoned animals. One listing can have several help tasks — catch, transport, vet care, foster, a permanent home — and different people can take different tasks without dumping everything into a group chat.

Guests can browse the feed, open a listing, read Help, and look at the map. An account is required to publish a listing, offer help, chat, or send a report.

## What it does

- Feed with search, filters (species, help type, urgency), and sort
- Listing with photos, condition, urgency, and separate help requests
- Offers on a request; only the author accepts or rejects, and only one offer is accepted
- Contact and meetup details open after accept, for the author and the accepted helper
- Text chat for that pair
- Public location is a chosen city, district, and optional street or landmark — not a private address
- Map of active listings (same filters as the feed)
- Profile, favorites, own listings and offers, in-app notifications and push
- Reports on listings and feedback from Help
- English and Russian UI, light and dark theme

## Stack

Expo SDK 58, React Native, TypeScript, Expo Router, Supabase (auth, Postgres, storage), TanStack Query, Zustand, React Hook Form, Zod, MapLibre (OpenStreetMap tiles, no Google Maps key), i18next.

## Run it

Node.js 22+ and npm. The map uses native code, so it does not work in Expo Go.

```bash
git clone https://github.com/Olya7me/PawLink.git
cd PawLink
npm install
cp .env.example .env
```

Put your Supabase project URL and anon key in `.env`. Do not put the service role key in the app. Auth is email and password through Supabase.

```bash
npm start
npx expo run:android   # or: npx expo run:ios
```

Apply the SQL in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) before the app can read and write data. `npm run web` runs the UI without an interactive map.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm run android` / `ios` / `web` | Open a platform |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Jest |

## Layout

```
app/            Expo Router screens
src/features/   auth, animals, help, chat, maps, notifications, …
src/shared/     UI kit
src/services/   Supabase client
src/theme/      color palettes and tokens
src/i18n/       en and ru
supabase/       SQL migrations
docs/           product spec, architecture, schema, setup
```

Longer notes live in [docs/](docs/): product spec, architecture, database schema, screens, and Supabase setup.

## License

[MIT](./LICENSE) © 2026 Olga Gumenyuk
