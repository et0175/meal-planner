# Business requirements: products analyser

The products analyser is a dedicated nutrition-calculation tool — separate from the Products database browser. It lets users compose a custom mixed list of **products and recipes** and instantly see the combined nutritional breakdown.

---

## Functional requirements

- Users compose a custom mixed list of products and recipes; each row can be either a product or a recipe.
- For products, the unit defaults to **g**; options include g, ml, pc, tbsp, tsp, serving.
- For recipes, the unit options are **"serving"** (default) and **"grams"**; nutrition columns are scaled accordingly.
- Nutrition columns (protein g, fat g, carbs g, kcal) recalculate live as item, unit, or quantity changes.
- **Flag columns — "This week" and "Next week":** toggles that mark whether the row item is planned for the respective week. Flags apply to both product rows (mirrored with All products) and recipe rows (mirrored with the recipe catalog). All unflagging and week-rollover rules from the respective catalogs apply.
- A **totals row** shows the sum of all nutrient columns.
- A **totals-per-100 g row** shows nutrient values normalised to 100 g total weight.
- Users can add a new product directly from this view without leaving the analyser.
- Rows can be removed individually.

---

## UI / Prototype spec

- Displayed as a **spreadsheet-like list view**, empty by default.
- **Column 1 — Item selector:** free-text input that narrows a merged list of All products and All recipes as the user types. Search results are sorted: **recently used items** (recently added to a meal plan or logged in tracking) first, then **items owned by the current user**, then all others alphabetically. Selecting a match pins the item to that row.
  - When the selected item is a recipe, the row's nutrition values are derived from the recipe's total ingredient nutrition (per the recipe's yield).
- **Column 2 — Unit:** dropdown. **Only units for which the product has a defined gram conversion are shown.** For products with no alternative units, only the product's base unit (e.g. g) and "serving" are available. Units without a conversion factor are not listed. The product's own base unit is always included in the dropdown, regardless of whether any alternative units are defined.
- **Column 3 — Quantity:** numeric input.
- **Calculated columns:** protein (g), fat (g), carbs (g), kcal.
