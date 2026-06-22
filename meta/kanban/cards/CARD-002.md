# CARD-002: Navigation Shell + Auth UI (Next.js)

**Status:** ready
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
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
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

—
