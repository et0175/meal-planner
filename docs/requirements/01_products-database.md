# Business requirements: products database

> **Decision (OQ-001):** User-added products are immediately visible to all users in All products. Only the creator can edit or delete their own products.

- Maintain a product database with a breakdown into nutritional components.
- Support filtering by product category.
- Support search for a specific product.
- Support three browse modes: **list view**, **cards view**, and **category cards view**.
  - In list view, products are displayed in a table with columns: name, category, protein (g), fat (g), carbs (g), fiber (g), kcal, serving size.
  - In cards view, each product is shown as a card with image, macros (including fiber), serving size, and diet tags.
  - In category cards view, products are grouped by category. Each category is shown as a clickable card; clicking a category card expands or navigates to a list of products in that category.
- Support **different units per product** (e.g. pieces for eggs, tablespoons for olive oil, grams for dry goods).
- Each product may define a **gram equivalent per unit** (e.g. 1 egg = 55 g, 1 tbsp olive oil = 14 g). This conversion factor is used to normalise quantities in the meal planner (grams mode) and products analyser.
- Users can add products. User-added products are immediately visible to all users in All products.
- Users can update or delete only products they added.
- Users can mark a product as planned for the **current week** or the **next week** independently.
  - Marking a product "This week" adds it to the Weekly summary in the Meal planner (Lunch slot by default).
  - Removing the "This week" or "Next week" flag:
    - If the product has no day-card assignments (only present in the Weekly summary): the planner assignment is removed automatically.
    - If the product has day-card assignments: the user is shown a confirmation prompt before any assignments are removed.
  - On week rollover (each Monday), "Next week" flags are automatically promoted to "This week" and the product is added to the current week's planner summary (Lunch slot by default).
- Support filtering by "This week" and "Next week" flags.
- Users cannot delete a product that is used as an ingredient in any recipe. The deletion is blocked and the user is shown which recipes reference the product.
- Clicking a product opens a **product detail card** showing:
  - Full nutritional breakdown displayed as a **pie chart** (protein / fat / carbs proportions by kcal).
  - Absolute macro values (protein g, fat g, carbs g, kcal).
  - **Units conversion table**: for each supported unit (g, ml, pc, tbsp, tsp, serving as applicable), the equivalent gram weight and the scaled nutrition values.
