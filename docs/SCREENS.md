# PawLink — Screens & Navigation

Product screens are **designed here**, not implemented yet. Current app has only a foundation shell (`app/index.tsx`).

## Navigation map (planned)

```
Unauthenticated
├── Welcome
├── Sign In
├── Sign Up
└── Reset Password

Authenticated (tabs)
├── Feed (stack)
│   ├── Animal Feed
│   ├── Filters
│   └── Animal Detail (stack)
│       ├── Help Request Detail
│       ├── Submit Offer
│       ├── Offer List (author)
│       └── Report
├── Create (stack)
│   ├── New Animal
│   └── Confirm / Success
├── My Hub (stack)
│   ├── Overview
│   ├── My Listings
│   ├── My Offers / Active Tasks
│   └── History
└── Profile (stack)
    ├── Profile View / Edit
    ├── Notifications
    ├── Settings (language)
    └── Sign Out
```

## Screen inventory

| Screen | Purpose |
|--------|---------|
| Welcome | Brand + CTA to sign in / up |
| Sign In | Email/password (Supabase Auth) |
| Sign Up | Create account |
| Reset Password | Request / confirm reset |
| Animal Feed | Browse listings; search; entry to filters |
| Filters | Species, help type, urgency, sort, area |
| Animal Detail | Photos, info, tasks, history, author |
| Help Request Detail | Status, description, offers CTA |
| Submit Offer | Message + submit |
| Offer List | Author reviews pending offers |
| New Animal | Multi-step form: media, details, location, help types |
| Create Success | Confirmation + link to detail |
| My Hub Overview | Shortcuts to listings / tasks |
| My Listings | Author’s animals |
| My Active Tasks | Accepted / in-progress requests |
| My Offers | Pending / past offers |
| History | Personal timeline of completions |
| Profile View/Edit | Name, city, photo, skills |
| Notifications | In-app notification list |
| Settings | Language (ru/en) |
| Report | Report animal or user |
| Not Found | Invalid route |

## Key user flows

### Publish a case

1. Create → fill animal form → select help types (creates N help_requests) → publish → open detail.

### Help someone

1. Feed → filter → open animal → choose open request → offer help → wait for accept → mark in progress / completed.

### Author coordinates

1. Notification / My Listings → animal → request → review offers → accept one → follow updates.

## Implementation note

When building screens, place route files under `app/` and UI under `src/features/*/components`. Reuse `Screen`, theme tokens, and i18n keys for all copy.
