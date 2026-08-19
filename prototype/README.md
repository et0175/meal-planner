# Meal Planner — Prototype

A client-rendered Next.js prototype of the Meal Planner product, built to validate UX flows against the requirements and user stories before backend implementation.

## What this is

- A single-page app (all views in `frontend/app/page.tsx`) with in-memory seed data — no backend, no persistence, no real user accounts
- Covers: meal planner, product/recipe browsing, product analyser, diets, shopping list, profile, search, and sign-in/register/forgot-password screens
- Refreshing the page resets all state to the seed data in `frontend/data/seed.ts`

See [AGENTS.md](./AGENTS.md) for the design brief and coding standards this prototype follows.

## Structure

```
prototype/
  AGENTS.md          # design brief, tech decisions, coding standards
  frontend/           # the Next.js app
    app/page.tsx       # all views and UI logic
    data/seed.ts        # dummy data
    types.ts             # shared TypeScript types (View, Item, Assignment, Diet, ...)
```

## Running it

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## Requirements traceability

Business requirements and user stories this prototype is built against live in `/docs/requirements` and `/docs/user-stories`.

## Limitations

Prototype only — dummy data, no persistence, no real authentication or user management. Not connected to the backend microservices in `backend/`.
