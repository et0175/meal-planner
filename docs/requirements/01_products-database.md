# Business requirements: products database

> **Decision (OQ-001):** User-added products are immediately visible to all users in All products. Only the creator can edit or delete their own products.

---

## Functional requirements

- Maintain a product database with a breakdown into nutritional components.
- Support filtering by product category.
- Support search for a specific product.
- Support **different units per product** (e.g. pieces for eggs, tablespoons for olive oil, grams for dry goods).
- Each product may define **one or more alternative units** with a gram equivalent per unit (e.g. 1 egg = 55 g, 1 tbsp olive oil = 14 g, 1 cup rolled oats = 90 g). These conversion factors are used to normalise quantities in the meal planner (grams mode) and products analyser.
- Users can add products. User-added products are immediately visible to all users in All products.
- Users can update or delete only products they added.
- Users can mark a product as planned for the **current week** or the **next week** independently.
  - Marking a product "This week" adds it to the Weekly summary in the Meal planner (Lunch slot by default).
  - Removing the "This week" or "Next week" flag:
    - If the product has no calendar assignments (only present in the Weekly summary): the planner assignment is removed automatically.
    - If the product has calendar assignments: the user is shown a confirmation prompt before any assignments are removed.
  - On week rollover (each Monday), "Next week" flags are automatically promoted to "This week" and the product is added to the current week's planner summary (Lunch slot by default).
- Support filtering by "This week" and "Next week" flags.
- Users cannot delete a product that is used as an ingredient in any recipe. The deletion is blocked and the user is shown which recipes reference the product.

---

## UI / Prototype spec

- Two browse modes: **list view** and **category cards view**. **Category cards view is the default** when the user opens All products.
  - In category cards view, one card is shown per product category. **No search bar or filter controls are displayed in this view.** Clicking a category card navigates to the products within that category only; the category filter is pre-set to the selected category and the list view is shown.
  - In list view, products are displayed in a table with columns: name, category, protein (g), fat (g), carbs (g), fiber (g), kcal, serving size. The list supports **sorting by any column** (ascending/descending toggle). Search and filter controls are available in list view only.
- When defining or editing an alternative unit in the product form, the unit type is selected from a **predefined dropdown list** (options: g, kg, ml, l, oz, lb, fl oz, cup, tbsp, tsp, pc, serving). Free-text unit entry is not supported.
- If the selected unit is not a weight unit (not g or kg), the gram-conversion input is labelled **"grams per [unit name]"** (example: unit = tbsp → label reads "grams per tbsp"; unit = cup → "grams per cup").
- Clicking a product opens a **product detail card** showing:
  - Full nutritional breakdown displayed as a **pie chart** (protein / fat / carbs proportions by kcal).
  - Absolute macro values (protein g, fat g, carbs g, kcal).
  - **Units conversion table**: for each supported unit (g, ml, pc, tbsp, tsp, serving as applicable), the equivalent gram weight and the scaled nutrition values.
