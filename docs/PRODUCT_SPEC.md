# PawLink — Product Spec

## Vision

**PawLink** is a mutual-aid platform for homeless and abandoned animals. It is not only a reporting tool: it coordinates rescue across multiple independent help tasks for the same animal.

## Problem

- Sightings and rescue needs are scattered across chats and social media.
- One animal often needs several kinds of help (catch, transport, vet, foster, home).
- Volunteers cannot easily discover nearby needs or claim a specific task without chaos.

## Solution

For each animal listing, create multiple **help requests**. Different people can offer help on different requests. Statuses and history keep coordination visible.

## Users

| Role | Goals |
|------|--------|
| Guest | Browse feed and animal detail cards without an account |
| Reporter / author | Publish an animal case, request help types, accept offers, track progress |
| Volunteer helper | Find needs, offer help on a specific task, complete it after accept |
| Foster / adopter | Respond to foster or permanent-home requests |
| Moderator (later) | Review reports / abuse (MVP only stores reports) |

## Core feature: multi-task help

One `animal` → many `help_requests` (catch, transport, vet, foster, permanent home, food, other).

Each request lifecycle:

`Open → Accepted → In progress → Completed` (or `Cancelled`)

Helpers submit many `help_offers`; **only the help request author** may accept or reject. **At most one offer** is accepted per request.

After accept, contact / meetup details become visible to the author and the accepted helper. Publicly, only **city + approximate location** are shown.

## Locked product decisions (2026-11-14)

1. Multiple offers allowed; single accept per help request  
2. Only help request author accepts/rejects  
3. Meetup/contact after accept only; public city + approximate location  
4. Account deletion anonymizes PII; rescue history kept without personal data  
5. No maps in MVP (city text)  
6. Text chat after accept (author + helper only)  
7. Basic reports only (no admin panel)  
8. Light theme only  
9. Guest browse of feed + animal cards; auth to create/respond  
10. Photos: ≤5 per animal, ≤5 MB, JPEG/PNG/WebP, compress when possible  

## Functional modules (MVP scope)

1. **Auth + profiles** — sign up / in / out, password reset, name, city, photo, skills, anonymized deletion  
2. **Animal feed** — guest-readable; search; filters (species, help type, urgency); sort; city text  
3. **Create listing** — auth required; photos (limits above), species, name, description, city, condition, urgency, help types  
4. **Animal card** — guest-readable public fields; tasks; history; gated contact after accept  
5. **Help coordination** — offers; author accept/reject; statuses  
6. **Rescue history** — timeline of updates/events  
7. **Personal area** — my listings, requests, offers, chats, active tasks, history  
8. **Notifications** — in-app inbox + device push  
9. **Chat** — text only after accept, author and helper  
10. **Reports** — report listing; Help feedback; store for later review  

## Non-goals (MVP)

- Maps / map pins  
- Chat attachments / typing indicators  
- Admin / moderation console
- User-profile reports
- Store submission
- Payments / crowdfunding  
- Exact private addresses in public UI  

## Platforms

- iOS and Android via React Native + Expo  
- Path to App Store / Google Play via EAS  

## Localization

Russian and English UI strings via i18n. Technical docs, commits, and PRs are English (see README conventions).

## Success metrics (draft)

- Listings created with ≥1 help request  
- Offers submitted / accepted  
- Requests completed  
- Time from open → first offer  
