# Meal Forge — Frontend

Next.js 15 App Router application for Meal Forge: a meal planning, nutrition analysis, and shopping list tool.

## What it implements

- **Authentication UI** — sign-in, register, forgot-password forms with validation and error handling
- **Navigation shell** — teal sidebar with module navigation, topbar with current module name and week-stats widget
- **Auth guard** — protects all app routes; redirects unauthenticated visitors to /sign-in
- **Meal Planning UI (CARD-006)** — full weekly planner at `/planner`:
  - Week navigation header (previous/next/today, diet label)
  - Week Summary tab — spreadsheet grid of assignments grouped by meal slot; add/remove rows; unit toggle
  - Calendar tab — week/4-day/single-day layout; per-cell add/remove/stepper; HTML5 drag-and-drop between slots/days
  - Plan Summary Panel — quick overview of all items by meal slot with "Add item" per slot
  - Nutrition progress bars per day and week (kcal, protein, fat, carbs) shown only when target is set
  - "Log day" / "Log week" / "Log item" actions with toast feedback
  - "Export PDF" — calls planning service, opens browser print dialog
- **Product Catalog UI (CARD-004)** — `/products` page with product table, filter bar, modals
- **Placeholder** — Shopping list (`/shopping`, stub for Increment 4)

## Getting started

```bash
cd frontend
npm install
cp .env.example .env.local   # create and fill env vars
npm run dev                  # http://localhost:3000
```

## Linting and formatting

```bash
npm run lint          # ESLint — must pass clean before committing
npm run format:check  # Prettier — must pass clean before committing
npm run format        # Auto-fix formatting issues
```

## Route map

| Route              | File                                      | Description                                                    |
| ------------------ | ----------------------------------------- | -------------------------------------------------------------- |
| `/`                | `src/app/page.tsx`                        | Root redirect: token present → `/planner`, absent → `/sign-in` |
| `/sign-in`         | `src/app/(auth)/sign-in/page.tsx`         | Sign-in form; calls `POST /auth/sign-in`                       |
| `/register`        | `src/app/(auth)/register/page.tsx`        | Registration form; calls `POST /auth/register`                 |
| `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` | Reset request; calls `POST /auth/reset-request`                |
| `/planner`         | `src/app/(app)/planner/page.tsx`          | Meal planner — week nav, summary grid, calendar, nutrition bars |
| `/products`        | `src/app/(app)/products/page.tsx`         | Product catalog (placeholder; Increment 2)                     |
| `/shopping`        | `src/app/(app)/shopping/page.tsx`         | Shopping list (placeholder; Increment 4)                       |

## Auth flow

1. User submits sign-in form
2. Frontend calls `POST /auth/sign-in` on the Identity service
3. On 200: stores `{token, accountId, email, role}` in `sessionStorage` under key `mf_session`
4. Redirects to `/planner`
5. `(app)/layout.tsx` validates the token by calling `GET /auth/session` on every navigation
6. On 401 / token absent: clears session, redirects to `/sign-in`

**Important:** session is stored in `sessionStorage`, not `localStorage`. It is tab-scoped and cleared on browser close (FR-002).

## API calls

All API calls go through wrappers in `src/lib/api/`:

| File          | Backend service  | Env var                    |
| ------------- | ---------------- | -------------------------- |
| `identity.ts` | Identity (auth)  | `NEXT_PUBLIC_IDENTITY_URL` |
| `planning.ts` | Planning service | `NEXT_PUBLIC_PLANNING_URL` |
| `catalog.ts`  | Catalog service  | `NEXT_PUBLIC_CATALOG_URL`  |
| `shopping.ts` | Shopping service | `NEXT_PUBLIC_SHOPPING_URL` |

Never call `fetch` directly in components.

## Environment variables

Create `.env.local` in the `frontend/` directory:

```env
NEXT_PUBLIC_IDENTITY_URL=http://localhost:8001
NEXT_PUBLIC_PLANNING_URL=http://localhost:8003
NEXT_PUBLIC_CATALOG_URL=http://localhost:8002
NEXT_PUBLIC_SHOPPING_URL=http://localhost:8004
```

For production, set these in your Vercel project environment variables.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript strict mode)
- **Tailwind CSS v4** with custom teal palette (`--color-teal-700: #1A6B6E`)
- **lucide-react** for icons
- **clsx + tailwind-merge** for conditional class composition

## Seeding backend

The frontend depends on a running Identity service. Seed a test user before first use:

```bash
docker exec mealplanner_new_1-identity-1 python seed.py
```

Or register a new user via the `/register` page.

## Deployment

- **Frontend**: Vercel — connect to the `frontend/` directory; push to `main` to deploy
- **Backend**: Railway — each service in `backend/<service>/` has its own `Dockerfile` and `railway.toml`
