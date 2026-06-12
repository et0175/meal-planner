# Business requirements: products database

- Maintain a product database with a breakdown into nutritional components.
- Support filtering by product category.
- Support search for a specific product.
- Support switching between **list view** and **cards view**.
  - In list view, products are displayed in a table with columns: name, category, protein (g), fat (g), carbs (g), kcal.
  - In cards view, each product is shown as a card with image, macros, and diet tags.
- Support **different units per product** (e.g. pieces for eggs, tablespoons for olive oil, grams for dry goods).
- Users can add products.
- Users can update or delete only products they added.
- Users can mark a product as planned for the **current week** or the **next week** independently.
  - Marking a product "This week" adds it to the Weekly summary in the Meal planner (Lunch slot by default).
- Support filtering by "This week" and "Next week" flags.
