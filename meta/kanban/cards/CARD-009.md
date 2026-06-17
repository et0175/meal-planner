# CARD-009: Recipe management — CRUD, ingredients, favorites, weekly mark, diet compat

**Status:** ready
**Priority:** P2
**Category:** feature
**Estimate:** 3d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/009-recipe-management
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

Implement the full recipe write surface: create recipe manually, edit/delete own recipes, edit ingredient lines, mark as favorite, mark for the current week, and tag recipe-diet compatibility. This is the critical dependency for CARD-012 (meal planning pool).

**Scope:**
- **COMP-003 Recipe Management Service (write path):**
  - `CreateRecipe(title, ingredients[], instructions, servings, metadata)` — ingredient lines must reference valid product IDs (INV-003); nutrition summary auto-derived on save via CatalogReadRepository (FR-015)
  - `UpdateRecipe(id, ...)` — owner-only (NFR-002). **POL-003:** `RecipeNutritionRecalculatedOnIngredientChange` must fire on every UpdateRecipe that touches ingredient lines
  - `DeleteRecipe(id)` — owner-only (NFR-002)
  - `UpdateRecipeIngredients(id, lines[])` — dedicated command; triggers POL-003
  - `MarkRecipeAsFavorite(id)` / `UnmarkRecipeAsFavorite(id)` — idempotent toggle (FR-013)
  - `MarkRecipeForWeek(id)` / `UnmarkRecipeFromWeek(id)` — calls WeeklySelectionSyncService port (ADR-0005); same pattern as CARD-007 for products (FR-014)
- **COMP-002 Dietary Tagging Service:** `TagRecipeWithDiet(recipeId, dietId)` — idempotent; persists; used by recipe filter in CARD-008 (FR-009)
- **UI:** "Add recipe" form (title, ingredient editor with product search, instructions, servings), recipe edit page (owner only), ingredient line editor

**Key constraint from handoff:**
> `RecipeNutritionRecalculatedOnIngredientChange` (POL-003) must fire on every `UpdateRecipe` that touches ingredient lines.
> `MarkRecipeForWeek` is the integration pin to Increment 4 — it must call WeeklySelectionSyncService port.

## Acceptance criteria

**FR-015** — Create recipe manually:
- Given: authenticated user, valid recipe payload (title, 3 ingredient lines referencing valid products, 2 servings) → HTTP 201, persisted with nutrition summary (AC-042)
- Given: ingredient line referencing non-existent product ID → HTTP 422, nothing persisted (AC-043 / INV-003)
- Given: unauthenticated → HTTP 401 (AC-044)

**FR-013** — Favorites:
- Given: recipe R not favorited → MarkRecipeAsFavorite → HTTP 200, appears in favorites filter (AC-037)
- Given: R already favorited → MarkRecipeAsFavorite again → idempotent, exactly one entry (AC-038)
- Given: R favorited → UnmarkRecipeAsFavorite → HTTP 200, no longer in favorites (AC-039)

**FR-014** — Weekly mark:
- Given: authenticated user, recipe R → MarkRecipeForWeek → HTTP 200, R in weekly selection list (AC-040)
- Given: unauthenticated → MarkRecipeForWeek → HTTP 401 (AC-104)
- Given: R marked → UnmarkRecipeFromWeek → HTTP 200, R no longer in weekly list (AC-041)

**FR-018 + FR-019** — Edit / delete:
- Owner can edit and delete own recipes; non-owners → HTTP 403 (NFR-002)
- Editing ingredient lines triggers POL-003 (nutrition recalculated on save)

**FR-009** — Recipe-diet compat:
- Given: authenticated user, recipe R, diet D → TagRecipeWithDiet → HTTP 200, R appears in diet-D filter (AC-027)
- Given: same tag submitted twice → idempotent (AC-028)

## Architecture context

- **FR:** FR-009, FR-013, FR-014, FR-015, FR-018, FR-019
- **NFR:** NFR-002 (ownership — zero exceptions), NFR-004 (structured log)
- **ADR:** ADR-0005 (WeeklySelectionSync — MarkRecipeForWeek calls the port), ADR-0007 (nutrition via CatalogReadRepository)
- **Policies:** POL-003 (RecipeNutritionRecalculatedOnIngredientChange)
- **Components:** COMP-003 (Recipe Management Service), COMP-002 (Dietary Tagging Service), COMP-006 (Catalog Read Repository), COMP-007 (WeeklySelectionSyncService Port), COMP-008 (Catalog DB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
