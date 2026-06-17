# Business requirements: products analyser

The products analyser is a dedicated nutrition-calculation tool — separate from the Products database browser. It lets users compose a custom mixed list of **products and recipes** and instantly see the combined nutritional breakdown.

- Display as a **spreadsheet-like list view**, empty by default.
- Users add rows to analyse (as an alternative to the recipe analyser); each row can be either a **product** or a **recipe**.
- **Column 1 — Item selector:** free-text input that narrows a merged list of All products and All recipes as the user types. Search results are sorted with **recently used items** (recently added to a meal plan or logged in tracking) shown first. Selecting a match pins the item to that row.
  - When the selected item is a recipe, the row's nutrition values are derived from the recipe's total ingredient nutrition (per the recipe's yield).
- **Column 2 — Unit:** dropdown. For products, defaults to **g**; options include g, ml, pc, tbsp, tsp, serving. For recipes, the unit is always "serving" (fixed).
- **Column 3 — Quantity:** numeric input.
- **Calculated columns:** protein (g), fat (g), carbs (g), kcal — recalculated live as item, unit, or quantity changes.
- **Flag columns:** "This week" and "Next week" — toggles that mark whether a **product** row is planned for the respective week (mirrored with All products). Flag columns are not shown for recipe rows.
- **Totals row:** sum of all nutrient columns.
- **Totals per 100 g row:** nutrient values normalised to 100 g total weight.
- Users can add a new product directly from this view without leaving the analyser.
- Rows can be removed individually.
