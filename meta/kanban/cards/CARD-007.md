# CARD-007: Weekly product marking

**Status:** ready
**Priority:** P2
**Category:** feature
**Estimate:** 1d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/007-weekly-product-marking
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-2
**Depends on:** CARD-005
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Add the "mark product for current week" toggle to the product list/card. This is the integration pin between the Catalog context and Meal Planning — it triggers `WeeklySelectionSyncService` so marked items feed the summary pool in CARD-012.

**Scope:**
- **COMP-001 Product Catalog Service:** `MarkProductForWeek(productId)` and `UnmarkProductFromWeek(productId)` commands
- **COMP-007 WeeklySelectionSyncService Port:** call the port stub (wired in CARD-001) on every mark/unmark. The real implementation (COMP-019) is wired in CARD-012 — for now the stub no-ops
- **UI:** toggle button on each product card and on the product detail; visual indicator for "marked this week"

**Key constraint from handoff:**
> `WeeklySelectionSyncService` port (COMP-007) must be wired at composition root before this increment ships; the Meal Planning implementation (COMP-019) can remain a stub until Increment 4.

## Acceptance criteria

**FR-006** — Weekly product marking:
- Given: authenticated user, product P not yet marked → MarkProductForWeek → HTTP 200, P appears in weekly selection list (AC-018)
- Given: P already marked → UnmarkProductFromWeek → HTTP 200, P no longer in weekly selection list (AC-019)
- Given: unauthenticated → MarkProductForWeek → HTTP 401 (AC-020)

## Architecture context

- **FR:** FR-006
- **ADR:** ADR-0005 (WeeklySelectionSync integration — port called here; COMP-019 impl in CARD-012)
- **Components:** COMP-001 (Product Catalog Service), COMP-007 (WeeklySelectionSyncService Port — stub), COMP-008 (Catalog DB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
