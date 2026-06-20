# Business Requirements: Shopping List

> **Decision (OQ-003):** All planned items appear in the grocery list — both recipe ingredients and standalone products added directly to the planner.

A dedicated module for generating a grocery list from the meal plan. It is a separate navigation item, not part of the Meal planner.

---

## Functional requirements

### Date range

- The user selects a from–to date range to scope which planned days are included.
- The default range is the current calendar week.
- An invalid date range (end date before start date) produces a validation error; the list is not generated.

### Plan summary

- The shopping list view displays a summary of all planned items within the selected date range, showing item name and total servings planned.

### Grocery list

- The system derives a grocery list from all planned items in the date range:
  - Planned recipes are expanded into their ingredients. Ingredient quantities are scaled by the ratio of planned servings to recipe yield (e.g. if a recipe yields 2 servings and 1 serving is planned, each ingredient amount is halved).
  - Standalone products added directly to the planner appear as single-line entries under their product category (no ingredient decomposition).
  - Quantities for the same ingredient or product across multiple entries are aggregated.
- The grocery list is grouped by product category: Produce, Dairy, Meat, Fish, Grains, Legumes, Nuts & Seeds, Beverages, Condiments, Other.
- Each line shows: ingredient name, total quantity, and unit.

### Auto-generation

- The grocery list is **generated automatically** as soon as the user navigates to the Shopping list view. No explicit "Generate" button press is required.
- The list is generated from the default date range (current calendar week) on first load.
- Changing the date range immediately regenerates the list from the new range.

### Stale state and refresh

- After a grocery list is generated, any change to the meal plan within the selected date range marks the list as stale.
- The user can refresh the list; doing so regenerates it from the current plan state and clears the stale indicator.

---

### PDF download

- The user can download the current grocery list as a **PDF file**.
- The file contains the categorised ingredient list (same groups and lines shown in the UI) and the selected date range.

> See also [`06_meal_planner.md`](06_meal_planner.md) — PDF export (meal plan PDF is a separate button in the Planner view).

---

## UI / Prototype spec

- A visible stale indicator is shown in the Shopping list view when the list is out of date with the meal plan.
- The plan summary section is displayed above the grocery list.
- A **"Download PDF"** button is displayed in the shopping list header.
