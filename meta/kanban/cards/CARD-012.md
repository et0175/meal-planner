# CARD-012: Meal plan core — date range, day cards, summary pool, weekly sync

**Status:** ready
**Priority:** P2
**Category:** feature
**Estimate:** 3d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/012-meal-plan-core
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-4
**Depends on:** CARD-007, CARD-009
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Implement the meal plan foundation: create a plan with date range, display one day card per day, implement the meal-prep summary pool, and replace the WeeklySelectionSyncService stub with the real implementation that populates the pool from weekly-marked products and recipes.

**Scope:**
- **COMP-019 WeeklySelectionSyncService Impl:** replace the no-op stub (wired in CARD-001) with the real implementation. On `MarkProductForWeek` / `MarkRecipeForWeek` events, calls `AddItemToSummary` for all active plans (POL-002, ADR-0005). Wired at composition root now — this is the critical composition-root replacement
- **COMP-018 Meal Plan Service:**
  - `CreateMealPlan(dateRange)` — defaults to current week; creates one DayCard per day in the range (FR-027)
  - `GetMealPlan(id)` — returns plan with day cards and summary pool items
  - `AddItemToSummary(planId, productOrRecipeId)` — adds item to the summary pool (called by COMP-019)
  - `GetSummaryPool(planId)` — returns all items in the summary pool
- **COMP-022 Planning DB:** full schema (meal_plans, summary_pool_items, day_cards tables with columns/indexes)
- **UI — planning canvas:**
  - Date range picker (FR-027)
  - Day cards grid (one card per day, displays the day's assigned meals — assignment UI in CARD-013)
  - Summary pool panel showing weekly-marked products and recipes

**Key constraints from handoff:**
> Wire `WeeklySelectionSyncService` Impl (COMP-019) at composition root now. The port from Increment 2 was a stub — replace with the real implementation that triggers `AddItemToSummary` for active plans (POL-002, ADR-0005).

## Acceptance criteria

**FR-027** — Date range + day cards:
- Given: user creates plan with date range Mon–Sun → one day card created per day; default range = current week

**FR-028** — Summary pool from weekly selections:
- Given: product P marked for week (CARD-007) → P appears in summary pool of all active plans (via COMP-019, POL-002)
- Given: recipe R marked for week (CARD-009) → R appears in summary pool

**ADR-0005** — WeeklySelectionSync:
- WeeklySelectionSyncService Impl (COMP-019) is wired at composition root; stub from CARD-001 is replaced

## Architecture context

- **FR:** FR-027, FR-028
- **ADR:** ADR-0005 (WeeklySelectionSync — real impl wired here), ADR-0007 (CatalogReadRepository for nutritional data in pool)
- **Policies:** POL-002 (AddItemToSummary triggered by weekly selection sync)
- **Components:** COMP-018 (Meal Plan Service), COMP-019 (WeeklySelectionSyncService Impl), COMP-022 (Planning DB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
