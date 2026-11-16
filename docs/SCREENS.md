# PawLink — Screens & Navigation

Auth, guest **Feed**, **Animal Detail**, auth-gated **Create listing**, **My activity**, **Help** FAQ (from Supabase `faq_items`), **Maps** placeholder, and **Help coordination** (request detail, submit offer, author accept/reject, post-accept contact) are implemented. Notifications / reports remain designed here until their feature slices.

Guest access (locked): unauthenticated users can open **Feed**, **Animal Detail**, **Help**, and **Maps**. Create, offers, edit, and personal areas require auth.

## Navigation map (current)

```
Root Stack
├── (tabs) — bottom tabs
│   ├── Feed — brand header + profile icon (signed-in) / sign-in (guest)
│   │   ├── Collapsible filters (city, species, urgency, help type, sort)
│   │   └── Animal cards → Animal Detail (stack)
│   ├── My activity — auth-aware
│   │   ├── Create publication CTA
│   │   ├── My publications (open / edit)
│   │   └── Offers I made → Help Request Detail
│   ├── Help — FAQ from Supabase (collapsible Q&A by locale; chrome via i18n)
│   └── Maps — placeholder (“soon”; city text in MVP, no map SDK)
├── Animal Detail `/animals/[id]`
│   └── Help requests → `/requests/[requestId]`
├── Edit listing `/animals/[id]/edit` (author, auth)
├── Create `/create` (auth)
├── Profile `/profile` (auth) — opened from feed header icon
├── Help Request Detail `/requests/[requestId]`
│   ├── Submit Offer (auth)
│   ├── Offer List (author)
│   └── Contact / meetup (after accept; parties only)
└── Auth stack
    ├── Sign In
    ├── Sign Up
    └── Reset Password
```

## Screen inventory

| Screen | Purpose | Auth |
|--------|---------|------|
| Feed (tab) | Browse listings; collapsible filters | Guest |
| My activity (tab) | My listings + my offers + create CTA | Guest sees sign-in gate |
| Help (tab) | Popular FAQ from `faq_items` (TanStack Query); UI chrome via i18n | Guest |
| Maps (tab) | Placeholder until maps; city text remains MVP location | Guest |
| Sign In | Email/password (Supabase Auth) | Guest |
| Sign Up | Create account | Guest |
| Reset Password | Request / confirm reset | Guest |
| Animal Detail | Photos, info, tasks, author (public) | Guest |
| Edit listing | Author updates public fields + status | Auth (author) |
| Help Request Detail | Status, description, offer CTA | Guest read; actions auth |
| Submit Offer | Message + submit | Auth |
| Offer List | Author reviews pending offers; accept one | Auth (author) |
| Contact / meetup | Post-accept private details | Auth (author + assignee) |
| New Animal | Media (≤5), details, city text, help types | Auth |
| Profile View/Edit | Name, city, photo, skills | Auth |
| Not Found | Invalid route | Guest |

## Key user flows

### Publish a case

1. Sign in → My activity → Create publication → fill animal form (city text, ≤5 photos) → select help types → publish → open detail.

### Help someone

1. Browse feed (guest OK) → open animal → sign in if needed → choose open request → offer help → wait for author accept → see contact/meetup → mark in progress / completed.

### Author coordinates

1. My activity → publication → animal → request → review offers → **accept one** (others remain rejected/withdrawn) → share/view meetup details → follow updates.

### Edit a publication

1. My activity → Edit on a listing → update public fields / status → save → return to detail.

## Out of scope screens (MVP)

- Map SDK / map picker (Maps tab is a placeholder; city text stays the location model)  
- Chat threads  
- Admin moderation console  
- Dark mode settings  
- In-app notifications list (planned)  
- Help feedback form (FAQ from Supabase this pass; no feedback form yet)  

### Help FAQ (backend content)

- Table: `faq_items` — see migration `00005_faq_items.sql` and [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) (run in SQL Editor; edit rows in Table Editor).
- App loads published rows for the active locale via TanStack Query; title/subtitle/empty/error stay in i18n.
- Project rule: prefer Supabase for fetchable copy/lists/configs — see [ARCHITECTURE.md](./ARCHITECTURE.md#content--data-ownership-project-wide).


## Implemented help routes

| Route | Screen |
|-------|--------|
| `/requests/[requestId]` | Help Request Detail (guest read; offer / author actions when signed in) |
| `/requests/[requestId]/offer` | Submit Offer (auth) |
| `/animals/[id]/edit` | Edit listing (author) |

Animal detail links each help request into `/requests/[requestId]`.

## Implementation note

Route files live under `app/` (tabs under `app/(tabs)/`). Feature UI stays in `src/features/*/components`. Reuse `Screen` (safe-area), theme tokens, and i18n keys for all copy. Colocate styles as `*.styles.ts` / `_*.styles.ts` — no `StyleSheet` in `.tsx`.
