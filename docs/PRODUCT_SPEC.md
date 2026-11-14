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
| Reporter / author | Publish an animal case, request help types, track progress |
| Volunteer helper | Find nearby needs, offer help on a specific task, complete it |
| Foster / adopter | Respond to foster or permanent-home requests |
| Moderator (later) | Review reports / abuse |

MVP focuses on reporter + helper. Formal roles can stay soft (skills on profile) until admin tooling is needed.

## Core feature: multi-task help

One `animal` → many `help_requests` (catch, transport, vet, foster, permanent home, food, other).

Each request has its own lifecycle:

`Open → Accepted → In progress → Completed` (or `Cancelled`)

Helpers submit `help_offers`; the author (or assignee rules — TBD) accepts one offer per request (MVP assumption: one active assignee).

## Functional modules (MVP scope)

1. **Auth + profiles** — sign up / in / out, password reset, name, city, photo, skills  
2. **Animal feed** — search, filters (species, help type, urgency), sort, approximate location  
3. **Create listing** — photos, species, name, description, location, condition, urgency, help types  
4. **Animal card** — photos, description, location, author, status, tasks, history  
5. **Help coordination** — requests, offers, accept/reject, statuses  
6. **Rescue history** — timeline of updates/events  
7. **Personal area** — my listings, requests, offers, active tasks, history  
8. **Notifications** — in-app for MVP; push designed but optional for first release  
9. **Reports** — report listing or user  

## Non-goals (stage 1–3)

- Product UI screens and business logic (blocked until architecture approval)
- Payments / crowdfunding
- Live chat (may use in-app notifications + external contact later — decision needed)
- Exact private addresses of foster homes in public UI

## Platforms

- iOS and Android via React Native + Expo
- Path to App Store / Google Play via EAS

## Localization

Russian and English from day one. All user-facing copy goes through i18n.

## Success metrics (draft)

- Listings created with ≥1 help request
- Offers submitted / accepted
- Requests completed
- Time from open → first offer

## Open product decisions

See [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) — decisions requiring user approval.
