# Business requirements: products analyser

The products analyser is a dedicated nutrition-calculation tool — separate from the Products database browser. It lets users compose a custom list of products and instantly see the combined nutritional breakdown.

- Display as a **spreadsheet-like list view**, empty by default.
- Users add rows to analyse (as an alternative to the recipe analyser).
- **Column 1 — Product selector:** free-text input that narrows the list from All products as the user types.
- **Column 2 — Unit:** dropdown defaulting to **g**; options include g, ml, pc, tbsp, tsp, serving.
- **Column 3 — Quantity:** numeric input.
- **Calculated columns:** protein (g), fat (g), carbs (g), kcal — recalculated live as product, unit, or quantity changes.
- **Flag columns:** "This week" and "Next week" — toggles that mark whether the product is planned for the respective week (mirrored with All products).
- **Totals row:** sum of all nutrient columns.
- **Totals per 100 g row:** nutrient values normalised to 100 g total weight.
- Users can add a new product directly from this view without leaving the analyser.
- Rows can be removed individually.
