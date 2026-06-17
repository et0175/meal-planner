# Business requirements: shopping list

> **Decision (OQ-003):** All planned items appear in the grocery list — both recipe ingredients and standalone products added directly to the planner.

A dedicated module for generating a grocery list from the meal plan. It is a separate navigation item, not part of the Meal planner.

## Date range

- The user selects a from–to date range to scope which planned days are included.
- The default range is the current calendar week.

## Plan summary

- The shopping list view displays a summary of all planned items within the selected date range, showing item name, total servings planned, and kcal contribution.

## Grocery list

- The system derives a grocery list from all planned items in the date range:
  - Planned recipes are expanded into their ingredients. Ingredient quantities are scaled by the ratio of planned servings to recipe yield (e.g. if a recipe yields 2 servings and 1 serving is planned, each ingredient amount is halved).
  - Standalone products added directly to the planner appear as single-line entries under their product category (no ingredient decomposition).
  - Quantities for the same ingredient or product across multiple entries are aggregated.
- The grocery list is grouped by product category: Produce, Dairy, Meat, Fish, Grains, Legumes, Nuts & Seeds, Beverages, Condiments, Other.
- Each line shows: ingredient name, total quantity, and unit.

## Stale state and refresh

- After a grocery list is generated, any change to the meal plan within the selected date range marks the list as stale.
- A visible stale indicator is shown in the Shopping list view.
- The user can refresh the list; doing so regenerates it from the current plan state and clears the stale indicator.
- An invalid date range (end date before start date) produces a validation error; the list is not generated.
