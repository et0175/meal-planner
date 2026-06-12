# Business requirements: shopping list

A dedicated module for generating a grocery list from the meal plan. It is a separate navigation item, not part of the Meal planner.

## Date range

- The user selects a from–to date range to scope which planned days are included.
- The default range is the current calendar week.

## Plan summary

- The shopping list view displays a summary of all planned items within the selected date range, showing item name, total servings planned, and kcal contribution.

## Grocery list

- The system derives a grocery list by expanding all planned recipes into their ingredients and aggregating quantities.
- The grocery list is grouped by product category: Produce, Dairy, Meat, Fish, Grains, Legumes, Nuts & Seeds, Beverages, Condiments, Other.
- Each line shows: ingredient name, total quantity, and unit.
