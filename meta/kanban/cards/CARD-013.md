# CARD-013: Interactive planning — assign, drag-and-drop, reorder, remove, servings

**Status:** ready
**Priority:** P2
**Category:** feature
**Estimate:** 3d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/013-interactive-planning
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-4
**Depends on:** CARD-012
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Implement the interactive planning interactions: assign summary pool items to day cards, drag-and-drop (with keyboard/touch fallback), reorder across days and sections, set servings per dish, and remove items from day cards (with pool sync).

**Scope:**
- **COMP-020 Day Scheduling Service:**
  - `AssignToDayCard(planId, dayId, summaryItemId, sectionId?)` — INV-012: item must be in summary pool before assignment; item remains in pool after assignment (FR-032)
  - `RemoveFromDayCard(planId, dayId, itemId)` — triggers POL-001: item removed from summary pool only if it is no longer assigned to any day card in the plan (INV-013); this is the highest edge-case-risk operation (handoff warning)
  - `ReorderDayCardItems(planId, dayId, newOrder[])` / `MoveItemBetweenDays(planId, fromDayId, toDayId, itemId)` — FR-033
  - `SetServings(planId, dayId, itemId, servings)` — nutrition summary scales with servings; calories and macros recalculated from CatalogReadRepository (ADR-0007, FR-035)
- **UI interactions:**
  - Drag-and-drop from summary pool to day card sections (FR-029); use a DnD library (dnd-kit recommended for React 19 compat)
  - Keyboard/touch fallback: tap-to-select + assign button (FR-032 / US-MP-009)
  - Reorder items across days and sections via drag (FR-033)
  - Per-item servings input on day cards
  - Remove button on day card items

**Key constraint from handoff:**
> INV-012 (item in pool before day assignment) and INV-013 (summary cleanup via POL-001) are the two invariants most likely to have edge-case bugs — prioritise acceptance test coverage for US-MP-010 (remove + sync).

## Acceptance criteria

**FR-029** — Assign from pool:
- Given: item I in summary pool → user assigns I to day card D → I appears on D; I still present in pool (FR-032 / INV-012)
- Given: item NOT in pool → assignment attempt → rejected (INV-012)

**FR-032** — Items remain in pool after assignment:
- Summary pool item stays visible after being placed on a day card (pool is not depleted by assignment)

**FR-033** — Reorder / move:
- User can move item from day D1 to day D2 (same week); item removed from D1 and appears on D2

**FR-034** — Remove from day card (⚠ highest-risk):
- Given: item I assigned only to day D → user removes I from D → I removed from pool (POL-001, INV-013)
- Given: item I assigned to days D1 AND D2 → user removes I from D1 → I stays in D2 AND stays in pool (INV-013)

**FR-035** — Servings:
- Given: dish X assigned with 2 servings → nutrition displayed as 2× the per-serving values; updating to 3 servings → nutrition updates to 3× (via CatalogReadRepository)

## Architecture context

- **FR:** FR-029, FR-032, FR-033, FR-034, FR-035
- **ADR:** ADR-0007 (nutrition via CatalogReadRepository for per-day aggregation)
- **Invariants:** INV-012 (pool membership before assignment), INV-013 (pool cleanup on last removal)
- **Policies:** POL-001 (summary pool cleanup when item removed from last day card)
- **Components:** COMP-020 (Day Scheduling Service), COMP-006 (Catalog Read Repository), COMP-022 (Planning DB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
