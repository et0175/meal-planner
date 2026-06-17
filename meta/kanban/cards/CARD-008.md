# CARD-008: Recipe catalog — browse, search, filter

**Status:** ready
**Priority:** P1
**Category:** feature
**Estimate:** 2d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/008-recipe-catalog-browse-search-filter
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-3
**Depends on:** CARD-005
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Implement the recipe catalog read surface: paginated list with nutrition summaries, filtering by category / diet / favorites / ownership, and recipe name search. This is the foundation CARD-009 (management) and CARD-011 (nutrition logging) build on.

**Scope:**
- **COMP-003 Recipe Management Service (read path):**
  - `ListRecipes(page, pageSize, category?, diet?, favoritesOnly?, myRecipesOnly?, query?)` — paginated
  - `SearchRecipes(query)` — full-text match on recipe name (FR-012)
  - `GetRecipe(id)` — full recipe card: image placeholder, ingredient lines, derived nutrition summary, servings, kcal per serving (FR-017)
  - Nutrition is derived via `CatalogReadRepository` (COMP-006) — no direct joins into product/nutrition tables (ADR-0007)
- **COMP-008 Catalog DB:** recipe tables (added on top of CARD-001 skeleton), with indexes for name search and category/diet filtering
- **UI — Recipe list page:**
  - Cards showing title, nutrition summary, servings
  - Filter panel: category, diet, favorites, my recipes
  - Search input

## Acceptance criteria

**FR-010** — Recipe list with nutrition:
- Given: 5 recipes each with 3+ ingredient lines → list returns recipes with nutrition summary (AC-029)
- Given: no recipes → empty array + HTTP 200 (AC-030)

**FR-011** — Filters:
- Given: 3 soup + 4 salad recipes, filter "soups" → exactly 3 returned (AC-031)
- Given: no recipes in "sandwiches" → empty array + HTTP 200 (AC-103)
- Given: user U has 2 favorites → favorites filter → exactly 2 (AC-032)
- Given: user U owns 3 recipes → "my recipes" filter → exactly 3 (AC-033)
- Given: 5 keto-tagged recipes → diet "keto" filter → exactly 5 (AC-034)

**FR-012** — Search:
- Given: "Caesar Salad", "Greek Salad", "Beef Stew", search "salad" → Caesar + Greek returned; Beef Stew absent (AC-035)
- Given: search "xylophone" → empty array + HTTP 200 (AC-036)

**FR-017** — Recipe card detail:
- Recipe card shows: title, ingredient lines (product name + qty + unit), derived nutrition summary, servings, kcal per serving

## Architecture context

- **FR:** FR-010, FR-011, FR-012, FR-017
- **ADR:** ADR-0007 (CatalogReadRepository for nutrition — no direct joins)
- **Components:** COMP-003 (Recipe Management Service), COMP-006 (Catalog Read Repository), COMP-008 (Catalog DB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
