# CARD-011: Meal logging + daily nutrition summary

**Status:** ready
**Priority:** P2
**Category:** feature
**Estimate:** 2d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/011-meal-logging-daily-nutrition
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-3
**Depends on:** CARD-008
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Implement meal logging and daily nutrition aggregation: users log their food intake as daily entries, and the system aggregates and displays a daily nutrition summary against their calorie corridor.

**Scope:**
- **COMP-015 Meal Log Service:**
  - `AddMealLogEntry(date, productOrRecipeId, qty, unit)` — adds an entry to the user's daily log
  - `UpdateMealLogEntry(id, qty, unit)` — updates an entry; triggers POL-005
  - `DeleteMealLogEntry(id)` — removes an entry; triggers POL-005
  - **POL-005:** `DailyNutritionSummaryRecalculatedOnLogChange` — must fire on every add, update, and delete (handoff: this policy must be explicitly tested)
- **COMP-016 Daily Nutrition Aggregator:**
  - `GetDailyNutritionSummary(date)` — aggregates all log entries for the day via `CatalogReadRepository` (COMP-006); reads calorie corridor **from JWT claims** (ADR-0006), not by calling Identity
  - Returns: total calories, protein, fat, carbs; comparison against corridor
- **COMP-017 Nutrition Tracking DB:** full schema (meal_log_entries table with product/recipe ref, qty, unit, date, user_id)
- **UI:** meal log page (date selector, entry list, "Add" form with product/recipe search); daily nutrition summary panel showing actuals vs. calorie corridor

**Key constraints from handoff:**
> Nutrition aggregator (COMP-016) reads calorie corridor from JWT claims — no Identity module call (ADR-0006).
> `DailyNutritionSummaryRecalculatedOnLogChange` (POL-005) must be tested: add, update, AND delete each trigger recomputation.

## Acceptance criteria

**FR-026** — Meal logging:
- Given: authenticated user logs product P (100g) on date D → entry persisted, daily summary recalculated
- Given: user updates qty of existing log entry → summary recomputed (POL-005)
- Given: user deletes a log entry → summary recomputed (POL-005)
- Given: user views daily summary for date D → total calories, protein, fat, carbs displayed; shown against calorie corridor from JWT

**ADR-0006** — Calorie corridor from JWT:
- Aggregator must read corridor from JWT token claims; must NOT call `/identity/profile` endpoint

## Architecture context

- **FR:** FR-026
- **ADR:** ADR-0006 (calorie corridor from JWT), ADR-0007 (nutrition data via CatalogReadRepository)
- **Policies:** POL-005 (DailyNutritionSummaryRecalculatedOnLogChange — mandatory; tested for add/update/delete)
- **Components:** COMP-015 (Meal Log Service), COMP-016 (Daily Nutrition Aggregator), COMP-006 (Catalog Read Repository), COMP-017 (Nutrition Tracking DB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
