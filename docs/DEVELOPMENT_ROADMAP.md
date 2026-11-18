# PawLink — Development Roadmap

## Stage status

| Stage | Content | Status |
|-------|---------|--------|
| 1 | Expo foundation, tooling, theme, i18n, Supabase skeleton | Done (PR #1) |
| 2 | Docs (spec, architecture, schema, screens, roadmap) | Done (PR #1) |
| 3 | Verification (typecheck, lint, test, Expo) | Done (PR #1) |
| 4 | Auth + DB schema / RLS | Done (PR #3) |
| 5 | Guest feed + create animal listing | Done (PR #5) |
| 6 | Help offers + accept/reject + status transitions | Done (PR #6) |
| 7 | Styles / shared UI extraction | Done (PR #7) |
| 8 | Tabs + My activity + feed header UX | Done |
| 9 | In-app notifications | Done (PR #14) |
| 10 | Feedback + listing reports | Done (PR #15) |
| 11 | Public map (city, district, optional street, pins) | Done |
| 12 | Dark theme | Next |
| 13 | Device push (Expo) | Done (needs EAS project id + migration 00011) |

## Locked product decisions (2026-11-14)

| # | Topic | Decision |
|---|--------|----------|
| 1 | Assignees | Many offers per `help_request`; **only one** may be accepted |
| 2 | Accept/reject | **Only the help request author** accepts or rejects offers |
| 3 | Private meetup | Contact / meetup details visible **only after accept**; public: city + approximate location |
| 4 | Account deletion | **Anonymize** PII; keep rescue history without personal data (no cascade-delete of shared history) |
| 5 | Maps | **Done**: city + district required, street optional; pin uses coordinates of the chosen public place |
| 6 | Chat | **Out of scope** (pet project) |
| 7 | Moderation | **Listing report + Help feedback** only; rows in Table Editor. No admin console, no user-profile reports |
| 8 | Theme | **Light now**; dark theme next |
| 9 | Guest feed | Guests may browse feed + animal detail; auth required to create listings/offers |
| 10 | Photos | Max **5** per animal; max **5 MB** each; JPEG / PNG / WebP; compress before upload when possible |

See also [PRODUCT_SPEC.md](./PRODUCT_SPEC.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

## MVP build order (next)

1. Auth + profile CRUD — done  
2. Create animal + help requests (with photo limits) — done  
3. Guest-readable feed + filters + animal detail (public fields) — done  
4. Offers (author accept/reject; post-accept contact reveal) — done  
5. Personal area (tabs: feed + my activity / listings / offers) — done  
6. In-app notifications — done  
6b. Device push via Expo — done after migration `00011` (`extra.eas.projectId` is in `app.json`)  
7. Reports / feedback (listing report + Help feedback in Table Editor) — done  
8. Public map pins — done  
9. Dark theme — next  
10. Polish  

## Out of scope

- In-app chat  
- Admin / moderation console  
- User-profile reports (`user_report` remains in the database enum only; no screen)  
- Store submission (App Store / Google Play)  

## Risks to track

- Privacy leaks via precise coordinates, EXIF in photos, or premature contact reveal  
- Empty marketplace (cold start) — seeding strategy out of scope for foundation  
- Expo / RN dependency drift — pin via `npx expo install`  

## Manual setup after merge

1. Create Supabase project (if not already)  
2. Copy URL + anon key into local `.env` (from `.env.example`)  
3. Apply migrations in order — see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)  
4. Configure Auth redirect URLs for password reset  
5. (Optional) EAS project + `eas.json`  

## Still open after the map

- Dark theme  
- Photo replace on edit  
- Fake seed data (optional)  

## Manual setup after feedback/reports slice

1. Apply migration `00009_feedback_and_reports.sql` in SQL Editor if not already (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)).  
2. Smoke-test: Help → feedback form (signed in) → row in **Table Editor → `reports`** with `kind=feedback`.  
3. Smoke-test: Animal detail → ⋯ → Report → reason + comment → row with `kind=listing_report` and `animal_id`.
