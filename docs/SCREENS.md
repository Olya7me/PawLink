# PawLink — Screens & Navigation

Auth, guest **Feed**, **Animal Detail**, and auth-gated **Create listing** are implemented. Offers / hub / notifications remain designed here until their feature slices.

Guest access (locked): unauthenticated users can open **Feed** and **Animal Detail**. Create, offers, and personal areas require auth.

## Navigation map (planned)

```
Public (guest-readable)
├── Animal Feed
├── Filters
└── Animal Detail (public fields only)
    └── Report (requires auth → prompt sign-in)

Unauthenticated auth stack
├── Welcome
├── Sign In
├── Sign Up
└── Reset Password

Authenticated (tabs)
├── Feed (stack) — same as public + offer actions
│   ├── Animal Feed
│   ├── Filters
│   └── Animal Detail (stack)
│       ├── Help Request Detail
│       ├── Submit Offer (auth)
│       ├── Offer List (help request author only)
│       ├── Contact / meetup (visible after accept)
│       └── Report
├── Create (stack) — auth required
│   ├── New Animal (≤5 photos, city text, help types)
│   └── Confirm / Success
├── My Hub (stack)
│   ├── Overview
│   ├── My Listings
│   ├── My Offers / Active Tasks
│   └── History
└── Profile (stack)
    ├── Profile View / Edit
    ├── Notifications
    ├── Settings (language; light theme only)
    ├── Delete account (anonymize)
    └── Sign Out
```

## Screen inventory

| Screen | Purpose | Auth |
|--------|---------|------|
| Welcome | Brand + CTA to sign in / up | Guest |
| Sign In | Email/password (Supabase Auth) | Guest |
| Sign Up | Create account | Guest |
| Reset Password | Request / confirm reset | Guest |
| Animal Feed | Browse listings; search; filters | Guest |
| Filters | Species, help type, urgency, sort, city | Guest |
| Animal Detail | Photos, info, tasks, history, author (public) | Guest |
| Help Request Detail | Status, description, offer CTA | Guest read; actions auth |
| Submit Offer | Message + submit | Auth |
| Offer List | Author reviews pending offers; accept one | Auth (author) |
| Contact / meetup | Post-accept private details | Auth (author + assignee) |
| New Animal | Media (≤5), details, city text, help types | Auth |
| Create Success | Confirmation + link to detail | Auth |
| My Hub Overview | Shortcuts to listings / tasks | Auth |
| My Listings | Author’s animals | Auth |
| My Active Tasks | Accepted / in-progress requests | Auth |
| My Offers | Pending / past offers | Auth |
| History | Personal timeline of completions | Auth |
| Profile View/Edit | Name, city, photo, skills | Auth |
| Notifications | In-app notification list | Auth |
| Settings | Language (ru/en); light theme | Auth |
| Delete account | Anonymize PII; keep history | Auth |
| Report | Report animal or user | Auth |
| Not Found | Invalid route | Guest |

## Key user flows

### Publish a case

1. Sign in → Create → fill animal form (city text, ≤5 photos) → select help types → publish → open detail.

### Help someone

1. Browse feed (guest OK) → open animal → sign in if needed → choose open request → offer help → wait for author accept → see contact/meetup → mark in progress / completed.

### Author coordinates

1. Notification / My Listings → animal → request → review offers → **accept one** (others remain rejected/withdrawn) → share/view meetup details → follow updates.

### Delete account

1. Profile → Delete account → confirm → PII scrubbed; rescue history remains without personal data.

## Out of scope screens (MVP)

- Map picker / map browse  
- Chat threads  
- Admin moderation console  
- Dark mode settings  

## Implementation note

When building screens, place route files under `app/` and UI under `src/features/*/components`. Reuse `Screen`, theme tokens, and i18n keys for all copy.
