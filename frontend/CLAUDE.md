# Meal Forge Frontend — Claude context

## What has been implemented (CARD-006: Meal Planning UI)

### Planner components (`src/planner/`)

- `WeekNav.tsx` — week navigation header: prev/next arrows, Today button (highlighted on current week), diet label badge
- `NutritionBar.tsx` — horizontal progress bar for one macro/kcal; shown only when target is set; red when over target
- `ProductSearchDropdown.tsx` — debounced combobox that calls `GET /plan/search?q=…`; order controlled by backend (recently-used → user-owned → alphabetical per FR-023)
- `WeekSummaryGrid.tsx` — spreadsheet-style grid: groups assignments by meal slot, rows = unique (product, slot), columns = Mon–Sun; add-row inline form with day selector; remove-row button; unit-display toggle; weekly totals footer
- `CalendarView.tsx` — week/4-day/single-day layout toggle; `DayColumn` sub-component with per-cell add form, stepper (+/–), log-item button, HTML5 native drag-and-drop (`draggable`, `onDragStart/Over/Drop`); log-day button per column; nutrition bars per day (when target set)
- `PlanSummaryPanel.tsx` — at-a-glance overview above calendar grid; all items grouped by slot; "Add item" inline form per slot

### Planner page (`src/app/(app)/planner/page.tsx`)

Full implementation replacing the CARD-002 placeholder:
- Week state (ISO "YYYY-WNN"), navigated by WeekNav
- Fetches assignments (`GET /plan?week=…&user_id=N`) on mount and on week change; refetches after mutations
- Fetches nutrition target (`GET /plan/target`) once on mount
- `useReducer` for async assignment state (avoids setState-in-effect ESLint error)
- Tab nav: "Week Summary" | "Calendar" (accessible role="tablist")
- "Log week" button (`POST /plan/log/week`) with success/error toast (auto-dismisses after 3 s)
- "Export PDF" button (`POST /plan/export/pdf`) → opens blob URL in `window.open` → triggers `win.print()`

### API wrapper updates (`src/lib/api/planning.ts`)

Full expansion of all planning service endpoints:
`getPlanSummary`, `getPlanAssignments`, `createAssignment`, `updateAssignment`, `deleteAssignment`, `moveAssignment`, `getNutritionTarget`, `updateNutritionTarget`, `searchPlanProducts`, `logDay`, `logWeek`, `logItem`, `exportPdf`

### Utility (`src/lib/utils/week.ts`)

ISO 8601 week helpers: `dateToIsoWeek`, `isoWeekToMonday`, `weekDates`, `formatWeekLabel`, `currentIsoWeek`, `prevWeek`, `nextWeek`, `shortDayLabel`, `isoDate`

### Tests (`src/__tests__/`)

- `WeekNav.test.tsx` — 7 tests (navigation, Today highlight, diet label)
- `WeekSummaryGrid.test.tsx` — 10 tests (render, add row, remove row, unit toggle, error states)
- `CalendarView.test.tsx` — 14 tests (layout switch, stepper, log actions, drag-drop, add flow)

---

## What has been implemented (CARD-002)

### Route groups

- `src/app/(auth)/` — public pages (no shell): sign-in, register, forgot-password
- `src/app/(app)/` — protected pages with sidebar + topbar shell
- `src/app/page.tsx` — root redirect (session present → /planner, absent → /sign-in)

### Components

- `src/shell/Sidebar.tsx` — teal sidebar with Nav links (Planner, Products, Shopping), user email, sign-out
- `src/shell/Topbar.tsx` — module heading + week-stats widget (Planner only, calls GET /plan/summary)
- `src/components/ui/Button.tsx` — primary / ghost / danger variants, loading state
- `src/components/ui/Input.tsx` — label, error, hint, aria attributes

### Hooks

- `src/lib/hooks/useAuth.ts` — reads/writes session from sessionStorage key `mf_session`
  - Uses `useReducer` internally (avoids `react-hooks/set-state-in-effect` lint error)
  - Exports `getStoredToken()` for use outside React (e.g., API calls)

### API wrappers

- `src/lib/api/identity.ts` — register, signIn, signOut, resetRequest, getSession
- `src/lib/api/planning.ts` — getPlanSummary (returns zero-state when service unavailable)

### Auth flow

1. User visits `/sign-in`, submits form
2. `signIn()` calls `POST /auth/sign-in` via `NEXT_PUBLIC_IDENTITY_URL`
3. On success: `saveSession()` writes `{token, accountId, email, role}` to `sessionStorage`
4. `router.push('/planner')` navigates to protected area
5. `(app)/layout.tsx` reads session, calls `GET /auth/session` to verify token (catches expiry)
6. If token missing or invalid: `removeSession()` + redirect to `/sign-in`

## Key decisions

### State management

- No global state library — auth state managed by `useAuth` hook (useReducer)
- Each page reads its own copy of session from sessionStorage on mount
- Token invalidation calls identity service sign-out + clears local session

### Auth guard pattern

- Client Component `(app)/layout.tsx` — uses `useReducer` for `authState` (`checking` | `authenticated` | `unauthenticated`)
- Shows loading spinner while `isLoading` is true (avoids flash of shell → redirect)
- Calls `getSession()` to validate token on every navigation into (app) routes
- This catches both missing tokens (AC-018) and expired tokens (AC-019)

### Topbar week-stats (ADR-0004)

- Calls `getPlanSummary(token, isoWeek)` only when pathname starts with `/planner`
- Zero-state (0 planned, 0 kcal) when planning service returns error or is unavailable
- No spinner loop: shows zeros immediately (AC-110)

### No-console rule

- No `console.log` / `console.error` in committed code

## How to run

```bash
# From /frontend
npm install
npm run dev      # starts on http://localhost:3000
npm run lint     # ESLint (must pass clean)
npm run format:check  # Prettier (must pass clean)
npm run format   # Auto-fix formatting
npm run build    # Production build
```

## Environment variables

| Variable                   | Required | Purpose                                                  |
| -------------------------- | -------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_IDENTITY_URL` | Yes      | Identity service base URL (e.g. `http://localhost:8001`) |
| `NEXT_PUBLIC_PLANNING_URL` | No       | Planning service base URL — zero-state if absent         |
| `NEXT_PUBLIC_CATALOG_URL`  | No       | Catalog service (used by CARD-004)                       |
| `NEXT_PUBLIC_SHOPPING_URL` | No       | Shopping service (used by CARD-008)                      |

## Non-obvious patterns and constraints

### `react-hooks/set-state-in-effect` (ESLint error)

- Next.js 16 + React 19 enable this rule by default
- Do NOT call `setState()` synchronously inside `useEffect` body
- Solution: dispatch to a `useReducer`, or only call setState in async `.then()` / `.catch()` callbacks

### Tailwind CSS v4

- Use `@import 'tailwindcss'` not `@tailwind base/components/utilities`
- Custom colors defined under `@theme { --color-* }` in globals.css
- `bg-teal-700` maps to `#1A6B6E` (brand primary)

### sessionStorage is client-only

- `readSession()` checks `typeof window === 'undefined'` before accessing storage
- Root `page.tsx` and all auth guards are Client Components

### Path alias

- `@/` resolves to `./` (configured in tsconfig.json paths)

## Files created (CARD-002)

```
frontend/src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                          ← root redirect
│   ├── (auth)/
│   │   ├── layout.tsx                    ← public layout
│   │   ├── sign-in/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   └── (app)/
│       ├── layout.tsx                    ← auth guard + shell
│       ├── planner/page.tsx              ← placeholder
│       ├── products/page.tsx             ← placeholder
│       └── shopping/page.tsx             ← placeholder
├── shell/
│   ├── Sidebar.tsx
│   └── Topbar.tsx
├── lib/
│   ├── api/
│   │   ├── identity.ts
│   │   └── planning.ts
│   └── hooks/
│       └── useAuth.ts
└── components/
    └── ui/
        ├── Button.tsx
        └── Input.tsx
```
