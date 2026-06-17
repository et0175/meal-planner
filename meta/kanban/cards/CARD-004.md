# CARD-004: OpenFoodFacts import + Catalog backend

**Status:** ready
**Priority:** P1
**Category:** enabler
**Estimate:** 2d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/004-openfoodfacts-import-catalog-backend
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-2
**Depends on:** CARD-002
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Implement the OpenFoodFacts seed import (CLI/script job run at deploy) and the Catalog backend services that all downstream features read through.

**Scope:**
- **COMP-005 OpenFoodFacts Import ACL:** CLI import job (or Next.js script) that:
  - Fetches/reads the OFF dataset
  - Filters: only entries with all four core macro fields populated (calories, protein, fat, carbohydrates)
  - Upserts into the catalog DB (idempotent — safe to re-run)
  - ADR-0001 decision: OFF is the chosen seed dataset
- **COMP-001 Product Catalog Service (read path):** list, filter, search (CARD-005 adds the UI)
- **COMP-002 Dietary Tagging Service:** 12+ named diets seeded with descriptions and macro-split guidance (FR-007). `TagProductWithDiet` and `TagRecipeWithDiet` commands
- **COMP-006 Catalog Read Repository:** the sole interface CTX-003 (Nutrition Tracking) and CTX-004 (Meal Planning) use to read nutritional data — no direct table joins outside this interface (ADR-0007). Implement `GetProductNutrition`, `GetRecipeNutrition`, `GetWeeklySelections`
- **COMP-008 Catalog DB (full schema):** add all columns/indexes on top of the skeleton from CARD-001

**Key constraint from handoff:**
> `CatalogReadRepository` (COMP-006) is the **only** interface CTX-003 and CTX-004 use to read nutritional data — no direct table joins outside this interface (ADR-0007).
> OFF seed import runs as a CLI job at deployment. Filter: all four core macro fields populated.

## Acceptance criteria

**CON-003** — OFF seed import:
- Given: OFF import script is run → at least 1,000 products persisted with name, calories, protein, fat, carbs all non-null
- Given: script run twice (idempotent) → no duplicate products created

**FR-007** — Diets seeded:
- Given: diet data is seeded → at least 12 diets each with a non-empty name and description (AC-021)
- Given: keto diet detail viewed → protein%, fat%, carbs% guidance fields all non-null (AC-102)
- Given: Intermittent Fasting detail viewed → macro fields absent or marked "not applicable" (AC-023)

**ADR-0007** — CatalogReadRepository is the sole read path:
- Nutrition Tracking and Meal Planning contexts must not query product/recipe tables directly

## Architecture context

- **FR:** FR-007 (diet list + descriptions), FR-008 (product-diet tag — command wired here)
- **CON:** CON-003 (OFF seed), CON-005 (recipe import AI — not in scope of this card; COMP-004 is CARD-010)
- **ADR:** ADR-0001 (OFF as product dataset), ADR-0007 (CatalogReadRepository sole read path)
- **Components:** COMP-001 (Product Catalog Service — read path), COMP-002 (Dietary Tagging Service), COMP-005 (OpenFoodFacts Import ACL), COMP-006 (Catalog Read Repository), COMP-008 (Catalog DB — full schema)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
