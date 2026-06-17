# CARD-014: Menu sections + shopping list

**Status:** ready
**Priority:** P2
**Category:** feature
**Estimate:** 2d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/014-menu-sections-shopping-list
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-4
**Depends on:** CARD-013
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Implement named menu sections on day cards, section configuration, and shopping list generation from the current meal plan.

**Scope:**
- **COMP-020 Day Scheduling Service — sections:**
  - `CreateSection(planId, dayId, name)` / `RenameSection(...)` / `DeleteSection(...)` — addable, deletable, renameable (FR-031)
  - Day card starts with default sections (e.g. Breakfast / Lunch / Dinner); user configures per plan
- **COMP-018 Meal Plan Service — summary sections:**
  - `CreateSummarySection(planId, name)` / etc. — sections on the summary pool itself (FR-030)
  - Items in the summary pool can be organised into named sections
- **COMP-021 Shopping List Service:**
  - `GenerateShoppingList(planId)` — aggregates all ingredients from all day card items using `CatalogReadRepository` to resolve product quantities from ingredient lines (ADR-0007, INV-016)
  - `RefreshShoppingList(planId)` — regenerates the list; previous list is replaced
  - **POL-004:** shopping list goes stale on plan changes → implemented as a **staleness flag** + explicit refresh (not auto-refresh, for predictable UX). A visual "stale" indicator shown when plan changes after last generation
- **COMP-022 Planning DB:** sections table, shopping_list_items table
- **UI:** section management UI on day cards and summary panel; shopping list view with grouped items; "Refresh" button when stale

**Key constraints from handoff:**
> Shopping list (COMP-021) uses `CatalogReadRepository` (COMP-006) to resolve product quantities from ingredient lines (ADR-0007, INV-016).
> POL-004 (shopping list goes stale on plan changes) should be implemented as a staleness flag + explicit refresh — NOT auto-refresh — to keep the UX predictable.

## Acceptance criteria

**FR-030** — Summary pool sections:
- User can add, delete, rename sections in the summary pool; items can be moved between sections

**FR-031** — Day card sections:
- Day card has default sections on creation; user can add, delete, rename sections per day card

**FR-036** — Shopping list:
- Given: a complete meal plan (items assigned to days with servings) → GenerateShoppingList → shopping list persisted with all product quantities aggregated (via CatalogReadRepository / INV-016)
- Given: user makes a change to the plan after generating the list → list shows "stale" indicator (POL-004)
- Given: user presses Refresh → list regenerated, staleness flag cleared

**POL-004** — Staleness, not auto-refresh:
- Shopping list is NOT automatically regenerated on plan changes; a stale flag is shown; user triggers refresh

## Architecture context

- **FR:** FR-030, FR-031, FR-036
- **ADR:** ADR-0007 (CatalogReadRepository for shopping list quantity resolution)
- **Invariants:** INV-016 (shopping list quantities resolved via CatalogReadRepository)
- **Policies:** POL-004 (shopping list staleness flag + explicit refresh)
- **Components:** COMP-018 (Meal Plan Service), COMP-020 (Day Scheduling Service), COMP-021 (Shopping List Service), COMP-006 (Catalog Read Repository), COMP-022 (Planning DB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
