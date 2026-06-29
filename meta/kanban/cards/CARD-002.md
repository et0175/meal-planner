# CARD-002: Navigation Shell + Auth UI (Next.js)

**Status:** done
**Priority:** P1
**Category:** feature
**Estimate:** 4d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/002-navigation-shell-auth-ui
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-1#ui
**Depends on:** CARD-001
**Review score:** 7 (cycle 1/3)
**Started:** 2026-06-25T00:00:00Z
**Closed:** 2026-06-29T00:00:00Z
**Actual:** 4d
**Merge commit:** 677602a
**Blocked by:** —

## What to implement

Next.js Navigation Shell + Auth UI (CTX-002, COMP-006–007):

**Auth forms (COMP-006):**
- `/sign-in` page — email + password form; calls `POST /auth/sign-in`; shows 401 and 429 errors; stores session token in sessionStorage
- `/register` page — email + password form; calls `POST /auth/register`; shows validation errors
- `/forgot-password` page — email form; calls `POST /auth/reset-request`; shows neutral success regardless of email existence

**Navigation Shell (COMP-006):**
- Sidebar — lists all modules (Products, Planner, Shopping List); highlights the active module; not rendered for anonymous users
- Auth guard — middleware/layout that redirects unauthenticated users to `/sign-in` for all protected routes
- Root `/` redirect — authenticated → `/planner`; unauthenticated → `/sign-in`

**Topbar (COMP-007):**
- Shows current module name
- In Planner: calls `GET /plan/summary` for week stats; renders zero-state gracefully when the endpoint returns empty (Increment 3 not yet implemented — return placeholder zeros)

Gate: unauthenticated access redirects to sign-in; session persists within tab (sessionStorage); sidebar renders only for authenticated users.

## Acceptance criteria

**FR-006 — Auth guard**
- AC-018: request to any authenticated route with no session → redirected to sign-in
- AC-019: expired session token → invalidated, redirect to sign-in

**FR-007 — Sidebar**
- AC-020: authenticated user on any screen → sidebar shows all modules with active-state highlight
- AC-108: unauthenticated request → sidebar not rendered

**FR-008 — Root route**
- AC-021: authenticated user navigates to "/" → Meal Planner screen rendered
- AC-109: unauthenticated visitor navigates to "/" → redirected to sign-in

**FR-009 — Topbar**
- AC-022: any authenticated module → topbar shows current module name
- AC-023: Meal Planner → topbar shows at-a-glance week stats
- AC-110: Meal Planner, no assignments → topbar shows zero-state (no error)

## Architecture context

- **FR:** FR-006, FR-007, FR-008, FR-009
- **NFR:** NFR-013 (WCAG 2.1 AA contrast ≥ 4.5:1), NFR-014 (responsive ≥ 1280px), NFR-015 (no layout shift on initial load)
- **ADR:** ADR-0004 (GET /plan/summary for topbar — returns empty until Increment 3)
- **Components:** COMP-006 (NavigationShell), COMP-007 (WeekStatsWidget)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

Implemented on branch `card/002-navigation-shell-auth-ui`.

**Files created:**
- `frontend/src/app/(auth)/` — sign-in, register, forgot-password pages + layout (public, no shell)
- `frontend/src/app/(app)/` — layout (auth guard + shell) + planner/products/shopping placeholder pages
- `frontend/src/app/page.tsx` — root redirect (token present → /planner, absent → /sign-in)
- `frontend/src/app/layout.tsx` + `globals.css` — root layout, Tailwind v4 with teal palette
- `frontend/src/shell/Sidebar.tsx` — teal sidebar, 3 nav items, sign-out
- `frontend/src/shell/Topbar.tsx` — module heading + week-stats (calls GET /plan/summary, zero-state when unavailable)
- `frontend/src/lib/api/identity.ts` — typed wrappers: register, signIn, signOut, resetRequest, getSession
- `frontend/src/lib/api/planning.ts` — getPlanSummary (zero-state guard for Increment 3 not yet live)
- `frontend/src/lib/hooks/useAuth.ts` — sessionStorage session management (useReducer pattern)
- `frontend/src/components/ui/Button.tsx` + `Input.tsx` — shared primitives
- `frontend/CLAUDE.md` + `frontend/README.md` — documentation

**Key decisions:**
- `useReducer` used in `useAuth` and `(app)/layout.tsx` auth guard to comply with `react-hooks/set-state-in-effect` lint rule (React 19 / Next.js 16 default)
- Auth guard calls `GET /auth/session` on every protected page load to catch expired tokens (AC-019)
- Topbar shows zero-state (`0 planned, 0 kcal`) without spinner loop when planning service absent (AC-110 / ADR-0004)
- sessionStorage key: `mf_session`

**Quality gates:** `npm run lint` and `npm run format:check` both pass clean.

[Build gate] FAILED (tsconfig @/* pointed at ./ instead of ./src/) → FIXED → PASSED
[Review 1/3] Score: 7 — crit: 5, imp: 5
  CRIT: text-gray-400 on white (2.54:1, need 4.5:1) in Topbar.tsx
  CRIT: text-white/60 sign-out on teal-700 (3.34:1) in Sidebar.tsx
  CRIT: text-white/70 email on teal-700 (3.96:1) in Sidebar.tsx
  CRIT: AC-019 gap — useEffect not re-run on route change; add pathname to deps in (app)/layout.tsx
  CRIT: Missing skip-to-main-content link (WCAG 2.4.1)
  IMP: aria-label on bare div without role in Topbar.tsx
  IMP: Loading spinner missing role="status" in (app)/layout.tsx
  IMP: Button missing aria-busy when loading
  IMP: signOut has no loading state
  IMP: Sign-out button missing type="button"
