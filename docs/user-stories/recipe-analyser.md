# User Stories: Recipe Analyser

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
- [ ] Empty-state and no-match messages are displayed clearly.

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
- [ ] Both flags are visible on recipe cards and in the recipe list view (as compact TW/NW toggle buttons per row).
- [ ] Marking “This week” adds the recipe to the Meal planner Weekly summary (Lunch slot by default, same as products).
- [ ] Removing “This week” when the recipe has no calendar assignments removes it from the Week summary automatically.
- [ ] Removing “This week” when the recipe already has calendar assignments shows a confirmation prompt before any assignments are removed.
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

## US-RA-011 Open recipe card with full summary, pie chart, and instructions

**As a** user  
**I want** to open a recipe card that shows image, ingredients, a nutrition pie chart, units conversion, prep time, and cooking instructions  
**So that** I can decide whether to cook or plan it, and have everything I need to actually make the dish.

Source: [04_recipe_analyser.md](../requirements/04_recipe_analyser.md) — Recipe card

**Acceptance criteria**

- [ ] Recipe card shows: image (or placeholder), ingredients summary, nutrition summary, number of servings, and calories per serving.
- [ ] The nutrition summary is displayed as a **pie chart** with slices for protein, fat, and carbs proportional to their caloric contribution.
- [ ] The card shows a **units conversion reference** for the recipe: g per serving weight and servings, with scaled nutrition values.
- [ ] The card shows **preparation time** when the field is populated.
- [ ] The card shows **step-by-step cooking instructions** when provided.
- [ ] All optional fields (image, prep time, instructions) are hidden when not provided; mandatory fields show sensible placeholders.

---

## US-RA-012 Edit or delete own recipes

**As a** user  
**I want** to update or delete only recipes I added  
**So that** shared or system recipes stay protected.

**Acceptance criteria**

- [ ] Edit and delete are only offered for user-owned recipes (unless admin).
- [ ] Attempting to delete a recipe that has planner assignments in the current or any future week is blocked; the user sees which days and meal slots the recipe is assigned to.
- [ ] Deleting a recipe that has assignments only in past weeks succeeds; past-week assignments are removed silently.
- [ ] If the recipe being deleted was included in a shopping list generated for a date range containing any of its assignments, the shopping list is marked stale after deletion.

---

## US-RA-013 Edit recipe ingredients with live nutrition preview

**As a** user editing my recipe  
**I want** to add, remove, or change ingredient amounts and see the nutrition totals update as I work  
**So that** I can evaluate the impact of each change before saving.

**Acceptance criteria**

- [ ] Ingredient editor supports add, remove, and quantity change with product linkage where applicable.
- [ ] A **nutrition summary** (kcal, protein, fat, carbs, fiber) is displayed at the **top of the edit form**, above the ingredient list.
- [ ] The nutrition summary **recalculates live** as ingredients are added, removed, or quantity-changed — without requiring the user to save first.
- [ ] After saving, the updated nutrition values are reflected on the recipe card immediately.

---

## US-RA-014 Browse recipes by category cards (default view)

**As a** user  
**I want** the recipe catalog to open as a grid of category cards, and to see only the recipes in a category when I click one  
**So that** I can navigate by dish type without scrolling through the full catalog.

Source: [04_recipe_analyser.md](../requirements/04_recipe_analyser.md) — Search and filter

**Acceptance criteria**

- [ ] The recipe catalog opens in **category cards view by default** (not a flat cards or list view).
- [ ] Category cards view shows one card per recipe category (Breakfasts, Soups, Main courses, etc.).
- [ ] Clicking a category card navigates to the list view filtered to that category only, with the category filter pre-set.
- [ ] A toggle allows switching between category cards view and list view.
- [ ] Individual recipe cards view (flat grid of recipe cards) is not available.
- [ ] A "back" or breadcrumb control returns the user from category list to the category cards view.

---

## US-RA-015 Recipe list includes fiber column

**As a** user comparing recipes in list view  
**I want** fiber displayed alongside the other macros in the recipe table  
**So that** I can evaluate dietary fiber content without opening each recipe card.

Source: [04_recipe_analyser.md](../requirements/04_recipe_analyser.md) — Search and filter

**Acceptance criteria**

- [ ] The recipe list view includes a **fiber (g)** column, positioned after carbs and before or after kcal/serving.
- [ ] Fiber values are taken from the recipe's total ingredient nutrition calculation.
- [ ] The fiber column is sortable in the same way as other nutrition columns.
