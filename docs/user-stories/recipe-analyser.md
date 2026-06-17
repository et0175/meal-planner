# User stories: recipe analyser

Requirements: [04_recipe_analyser.md](../requirements/04_recipe_analyser.md)

---

## US-RA-001 Browse recipes with nutrition and ingredients

**As a** user or nutritionist  
**I want** a recipe database where each recipe shows nutrition and ingredient lines linked to products  
**So that** totals stay consistent with All products.

**Acceptance criteria**

- [ ] Recipe list shows enough context to choose a recipe (title, key metadata as defined by UX).
- [ ] Recipe detail shows ingredients mapped to products where applicable and a nutrition breakdown.

---

## US-RA-002 Recipe list is scannable without opening each item

**As a** user  
**I want** each recipe in the list to show enough information to make a choice  
**So that** I do not have to open every card to decide what to cook or plan.

**Acceptance criteria**

- [ ] Each item in the recipe list shows at minimum: title, category, and a macro or calorie summary.
- [ ] Filter and search controls are visible alongside the list on the same screen (no separate page required).
- [ ] The list renders in a consistent grid or row layout with no broken or mixed item sizes.

---

## US-RA-003 Filter recipes by category

**As a** user  
**I want** to filter recipes by category (appetizers, salads, sandwiches, breakfasts, soups, mains, snacks, sauces, desserts, baked dishes, drinks, low-calorie, low-budget, kid-friendly, and related)  
**So that** I can find the right type of dish.

**Acceptance criteria**

- [ ] Category filter exists and includes the categories named in requirements (exact set configurable if product adds more).
- [ ] Selecting a category restricts the list accordingly.

---

## US-RA-004 Filter favorites or my recipes

**As a** user  
**I want** to show only my favorite recipes or only recipes I created  
**So that** I can work from a shortlist.

**Acceptance criteria**

- [ ] Toggle or filter for “favorites only” shows only favorited recipes.
- [ ] Toggle or filter for “my recipes only” shows only recipes owned by the current user.

---

## US-RA-005 Filter recipes by diet

**As a** user on a specific diet  
**I want** to filter recipes by diet type  
**So that** I only see compatible dishes.

**Acceptance criteria**

- [ ] Diet filter is available on the recipe browsing UI.
- [ ] Results respect diet compatibility set in the dietary analyser (or equivalent source of truth).

---

## US-RA-006 Search for a recipe

**As a** user  
**I want** to search recipes by name or relevant fields  
**So that** I can open a known recipe quickly.

**Acceptance criteria**

- [ ] Search input updates the recipe list based on the query.
- [ ] Clear empty and no-match states.

---

## US-RA-007 Mark recipe as favorite

**As a** user  
**I want** to mark a recipe as a favorite  
**So that** I can return to it without searching again.

**Acceptance criteria**

- [ ] Favorite action is available from list and/or detail view.
- [ ] State persists and appears in “favorites only” filter.

---

## US-RA-008 Mark recipe for the current week or next week

**As a** user planning the week  
**I want** to mark a recipe as selected for the current week or the next week (independently)  
**So that** it appears in the appropriate planner flow, matching the same flags available on products.

**Acceptance criteria**

- [ ] User can toggle “This week” and “Next week” flags on a recipe independently.
- [ ] Both flags are visible on recipe cards.
- [ ] Marking “This week” adds the recipe to the Meal planner Weekly summary (Lunch slot by default, same as products).
- [ ] Removing “This week” when the recipe has no day-card assignments removes it from the Weekly summary automatically.
- [ ] Removing “This week” when the recipe already has day-card assignments shows a confirmation prompt before any assignments are removed.
- [ ] On week rollover (each Monday), “Next week” flags auto-promote to “This week” and the recipe appears in the current week's planner summary (Lunch slot by default).

---

## US-RA-009 Add a recipe manually

**As a** user  
**I want** to create a recipe by entering ingredients and instructions manually  
**So that** family or proprietary dishes are in the system.

**Acceptance criteria**

- [ ] Manual creation form captures ingredients (with product linkage where required), steps, servings, and metadata needed for nutrition calculation.
- [ ] A recipe with no ingredients can be saved; nutrition shows all zeros and the recipe contributes no lines to the grocery list until ingredients are added.
- [ ] Saved recipe appears in “my recipes” and in search/browse as appropriate.

---

## US-RA-010 Import a recipe from external sources

**As a** user  
**I want** to add a recipe from a PDF, website, or YouTube  
**So that** I do not have to retype content I already have.

**Acceptance criteria**

- [ ] User can start an import flow for website URL and PDF (MVP sources).
- [ ] Imported content becomes an editable draft or saved recipe with ingredients and nutrition populated as accurately as the pipeline allows.
- [ ] YouTube import is not available in MVP1.

---

## US-RA-011 Open recipe card with full summary

**As a** user  
**I want** to open a recipe card that shows image, ingredients summary, nutrition summary, servings, and calories per serving  
**So that** I can decide whether to cook or plan it.

**Acceptance criteria**

- [ ] Recipe card shows all fields listed in requirements when data exists; sensible placeholders when optional media is missing.

---

## US-RA-012 Edit or delete own recipes

**As a** user  
**I want** to update or delete only recipes I added  
**So that** shared or system recipes stay protected.

**Acceptance criteria**

- [ ] Edit and delete are only offered for user-owned recipes (unless admin).
- [ ] Attempting to delete a recipe that has planner assignments in the current or any future week is blocked; the user sees which days and meal slots the recipe is assigned to.
- [ ] Deleting a recipe that has assignments only in past weeks succeeds; past-week assignments are removed silently.

---

## US-RA-013 Edit recipe ingredients

**As a** user editing my recipe  
**I want** to add, remove, or change ingredient amounts  
**So that** nutrition totals stay correct after changes.

**Acceptance criteria**

- [ ] Ingredient editor supports add, remove, and quantity change with product linkage where applicable.
- [ ] Nutrition summary updates after save according to the calculation engine.
