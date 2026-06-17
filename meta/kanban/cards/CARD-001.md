# CARD-001: DB schema + infrastructure skeleton

**Status:** done
**Priority:** P1
**Category:** enabler
**Estimate:** 2d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/001-db-schema-infrastructure-skeleton
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-1
**Depends on:** —
**Review score:** 9/10
**Started:** 2026-06-16T09:00:00Z
**Closed:** 2026-06-16T12:15:16Z
**Actual:** 0.4d
**Merge commit:** f18b9ce
**Blocked by:** —

## What to implement

Create the database schema (via Prisma or SQL migrations) for all four bounded contexts, and wire the composition root so that subsequent increments can add tables without DDL conflicts.

**Scope:**
- DB schema / migration scripts for all four contexts:
  - **CTX-002 Identity DB (COMP-014):** `users`, `sessions` tables (skeleton — full columns added in CARD-002)
  - **CTX-001 Catalog DB (COMP-008):** `products`, `diets`, `product_diet_tags`, `recipes`, `recipe_ingredients`, `weekly_selections` tables (skeleton)
  - **CTX-003 Nutrition Tracking DB (COMP-017):** `meal_log_entries` table (skeleton)
  - **CTX-004 Planning DB (COMP-022):** `meal_plans`, `summary_pool_items`, `day_cards`, `day_card_items`, `shopping_lists` tables (skeleton)
- `WeeklySelectionSyncService` port stub wired at composition root (no-op implementation is fine; CARD-012 replaces it with the real impl)
- All four schema contexts created in this increment so subsequent increments can add columns/indexes without touching the baseline DDL

**Key constraint from handoff:**
> DB migrations for all four contexts must be created in Increment 1 so subsequent increments can add tables without DDL conflicts.

## Acceptance criteria

Infrastructure card — no FR-linked ACs. Definition of done:
- All four schema contexts have at least one table each (skeleton columns only — full schema added per-increment)
- `WeeklySelectionSyncService` interface is defined and a no-op stub is wired at the composition root
- `npm run build` passes after this card

## Architecture context

- **FR:** (none — infrastructure)
- **NFR:** NFR-001 (auth middleware scaffolded by composition root), NFR-004 (structured logging foundation)
- **ADR:** ADR-0005 (WeeklySelectionSync integration — stub wired here), ADR-0006 (JWT embed — schema must include calorie-corridor fields on user profile)
- **Components:** COMP-008 (Catalog DB), COMP-014 (Identity DB), COMP-017 (Nutrition Tracking DB), COMP-022 (Planning DB), COMP-007 (WeeklySelectionSyncService Port — stub)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
