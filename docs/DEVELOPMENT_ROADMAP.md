# PawLink — Development Roadmap

## Stage status

| Stage | Content | Status |
|-------|---------|--------|
| 1 | Expo foundation, tooling, theme, i18n, Supabase skeleton | Done in this PR |
| 2 | Docs (spec, architecture, schema, screens, roadmap) | Done in this PR |
| 3 | Verification (typecheck, lint, test, Expo) | Done in this PR |
| 4+ | Product features | **Blocked** until user approves architecture |

## MVP build order (after approval)

1. Auth + profile CRUD  
2. Create animal + help requests  
3. Feed + filters  
4. Animal detail + offers accept/reject  
5. Personal area (my listings / tasks)  
6. In-app notifications  
7. Reports  
8. Polish, EAS preview builds  
9. Push notifications (optional stretch)  

## Decisions requiring user approval

Architecture and product choices to confirm before feature work:

1. **Assignee model** — one active helper per help request (recommended MVP) vs multiple concurrent helpers.  
2. **Who accepts offers** — only listing author, or also current assignee / moderators.  
3. **Private location / meetup details** — after accept: in-offer message only, separate private field, or external contact (phone/Telegram)?  
4. **User deletion policy** — cascade-delete listings vs anonymize.  
5. **Maps** — city/text only for MVP vs map pins with coarse geohash.  
6. **Chat** — none in MVP (recommended) vs simple threads.  
7. **Moderation** — reports queue only vs admin role in v1.  
8. **Dark mode** — deferred (current decision) vs required for MVP.  
9. **Guest browse** — must sign in to view feed vs public read.  
10. **Photo limits** — max count / size per listing.  

## Risks to track

- Privacy leaks via precise coordinates or photos with EXIF  
- Empty marketplace (cold start) — seeding strategy out of scope for engineering stage 1  
- Expo / RN dependency drift — pin via `npx expo install`  

## Manual setup after merge

1. Create Supabase project  
2. Copy URL + anon key into local `.env` (from `.env.example`)  
3. Review and apply migrations (replace skeleton)  
4. Configure Storage buckets + RLS  
5. (Optional) EAS project + `eas.json`  

## Out of scope until approval

- Product screens and business logic  
- Fake seed data / demo auth  
- Production EAS submit  
