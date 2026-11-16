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
| 10 | Feedback + listing reports | This PR |
| 11+ | Polish, EAS preview, push (optional) | Next |

## Locked product decisions (2026-11-14)

| # | Topic | Decision |
|---|--------|----------|
| 1 | Assignees | Many offers per `help_request`; **only one** may be accepted |
| 2 | Accept/reject | **Only the help request author** accepts or rejects offers |
| 3 | Private meetup | Contact / meetup details visible **only after accept**; public: city + approximate location |
| 4 | Account deletion | **Anonymize** PII; keep rescue history without personal data (no cascade-delete of shared history) |
| 5 | Maps | **City as text** in MVP; maps later |
| 6 | Chat | **Not in MVP** |
| 7 | Moderation | **Basic**: report listing/user + store reports; no admin panel yet |
| 8 | Theme | **Light only**; dark mode later |
| 9 | Guest feed | Guests may browse feed + animal detail; auth required to create listings/offers |
| 10 | Photos | Max **5** per animal; max **5 MB** each; JPEG / PNG / WebP; compress before upload when possible |

See also [PRODUCT_SPEC.md](./PRODUCT_SPEC.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

## MVP build order (next)

1. Auth + profile CRUD — done  
2. Create animal + help requests (with photo limits) — done  
3. Guest-readable feed + filters + animal detail (public fields) — done  
4. Offers (author accept/reject; post-accept contact reveal) — done  
5. Personal area (tabs: feed + my activity / listings / offers) — done  
6. In-app notifications — done (no push yet)  
7. Reports / feedback (store in Table Editor; no admin UI) — this PR  
8. Polish, EAS preview builds  
9. Push notifications (optional stretch)  

## Explicitly deferred past MVP

- Maps SDK / map pins  
- In-app chat  
- Dark mode  
- Full admin / moderation console  
- Precise public coordinates  

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

## Out of scope in feedback/reports PR

- Admin moderation console (use Table Editor)  
- In-app user-profile report UI (`user_report` ready in schema)  
- Push notifications (Expo Notifications)  
- Photo replace on edit  
- Fake seed data  
- Production EAS submit  

## Manual setup after feedback/reports slice

1. Apply migration `00009_feedback_and_reports.sql` in SQL Editor if not already (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)).  
2. Smoke-test: Help → feedback form (signed in) → row in **Table Editor → `reports`** with `kind=feedback`.  
3. Smoke-test: Animal detail → ⋯ → Report → reason + comment → row with `kind=listing_report` and `animal_id`.
