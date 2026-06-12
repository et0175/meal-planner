# Raw Requirements

Source: `Meal-forge/docs/requirements/`. Seeded 2026-06-12.

---

## Product Analyser

# processed: 2026-06-12 → FR-001
- Maintain a product database with a breakdown into nutritional components.
# processed: 2026-06-12 → FR-002
- Support filtering by product category.
# processed: 2026-06-12 → FR-003
- Support search for a specific product.
# processed: 2026-06-12 → FR-001 (interaction pattern noted in acceptance criteria)
- Product search and browsing should follow the interaction pattern of Calorizator product analyser (reference screenshots in docs).
# processed: 2026-06-12 → FR-004
- Users can add products.
# processed: 2026-06-12 → FR-005
- Users can update or delete only products they added.
# processed: 2026-06-12 → FR-006
- Users can mark a product as selected for the current week.

---

## Dietary Analyser

# processed: 2026-06-12 → FR-007
- The module lists multiple nutrition systems or diet patterns: Mediterranean diet, Plant-based and flexitarian, MIND diet, DASH diet, Paleo diet, WeightWatchers (WW), Intermittent fasting, Ketogenic (keto) diet, Volumetrics, Protein-focused patterns, Healthy fats emphasis, Hydration guidance.
# processed: 2026-06-12 → FR-007
- Each diet includes a short description and, where applicable, guidance on splitting daily intake across protein, fat, and carbohydrate.
# processed: 2026-06-12 → FR-008, FR-009
- Users can mark products and recipes as compatible with a given diet.

---

## Recipe Analyser

# processed: 2026-06-12 → FR-010
- Maintain a recipe database with a breakdown into nutritional components and ingredient lines mapped to products.
# processed: 2026-06-12 → FR-011
- Filter by recipe category: Appetizers, Salads, Sandwiches, Breakfasts, Soups, Main courses, Snacks, Sauces, Desserts, Baked dishes, Drinks, Low-calorie, Low-budget, Kid-friendly dishes.
# processed: 2026-06-12 → FR-011
- Show only favorites or only the current user's recipes.
# processed: 2026-06-12 → FR-011
- Filter recipes by diet type.
# processed: 2026-06-12 → FR-012
- Search for a specific recipe.
# processed: 2026-06-12 → FR-013
- Mark a recipe as a favorite.
# processed: 2026-06-12 → FR-014
- Mark a recipe as selected for the current week.
# processed: 2026-06-12 → FR-015
- Add a recipe manually.
# processed: 2026-06-12 → FR-016
- Add a recipe from external sources (PDF, website, YouTube).
# processed: 2026-06-12 → FR-017
- Open a full recipe card: image, ingredients summary, nutrition summary, number of servings, calories per serving.
# processed: 2026-06-12 → FR-018
- Users can update or delete only recipes they added.
# processed: 2026-06-12 → FR-019
- When editing a recipe, users can change ingredients (add, remove, or change amounts).

---

## Personal Cabinet

# processed: 2026-06-12 → FR-020, FR-021, FR-022, FR-023, FR-024
- User can maintain: email and password, language, unit system (metric or other), gender, age, weight, body composition (as supported by the product).
# processed: 2026-06-12 → FR-025
- User selects diet preferences, sees a recommended calorie range, and sets or adjusts the protein, fat, and carbohydrate split.
# processed: 2026-06-12 → FR-026
- Log food intake (products and recipes) and view a daily nutrition summary.

---

## Meal Planner

# processed: 2026-06-12 → FR-027
- By default, the range is the current calendar week (start through end), but the user can change it.
# processed: 2026-06-12 → FR-027
- The system shows one card per day in the selected range.
# processed: 2026-06-12 → FR-027
- The page also includes a meal-prep summary listing all dishes planned for that range.
# processed: 2026-06-12 → FR-028
- Products and recipes marked for the current week appear in the summary area.
# processed: 2026-06-12 → FR-029
- The user can filter and select products and recipes (for example via drag-and-drop) and place them into the summary.
# processed: 2026-06-12 → FR-030
- Selected products and recipes can be organized into menu sections: breakfasts, lunches, dinners, desserts, salads, and snacks.
# processed: 2026-06-12 → FR-030
- The user can add, delete, or rename these sections.
# processed: 2026-06-12 → FR-031
- Each day card includes breakfast, lunch, dinner, and snacks by default.
# processed: 2026-06-12 → FR-031
- The user can add, delete, or rename sections on a day card.
# processed: 2026-06-12 → FR-032
- The user can drag items from the summary into a day card section; items remain in the summary after placed on a day card.
# processed: 2026-06-12 → FR-033
- The user can drag items between different day cards and between sections on the same day card.
# processed: 2026-06-12 → FR-029
- The user can select items in another way (not only drag-and-drop).
# processed: 2026-06-12 → FR-034
- The user can remove an item from a day card; if it does not appear on any other day card, it is removed from the summary as well.
# processed: 2026-06-12 → FR-035
- The user can set the number of servings for each dish on a day card.
# processed: 2026-06-12 → FR-035
- Each day card shows a nutrition summary for its contents.
# processed: 2026-06-12 → FR-036
- Generate a shopping list from the meal plan, or refresh an existing shopping list from the current plan.

---

## Decisions made (2026-06-12)

# processed: 2026-06-12 → CON-001
- **Platform:** Web + mobile long-term; MVP1 is web only.
# processed: 2026-06-12 → CON-002
- **Auth:** Email/password for MVP1; social login deferred to a later iteration.
# processed: 2026-06-12 → CON-006
- **Body composition:** Simple metrics only (e.g., weight, BMI — no wearable integrations in scope).
# processed: 2026-06-12 → CON-005, DEC-002
- **Recipe import pipeline:** OpenAI-based AI parsing is the preferred direction; exact tech stack to be decided in a dedicated brainstorm (defer to architecture decision).
# processed: 2026-06-12 → CON-003, DEC-001
- **Product database:** Pre-seeded dataset (source TBD — USDA, OpenFoodFacts, etc.); users can extend with custom products.
# processed: 2026-06-12 → INV-002, INV-005, NFR-002
- **Ownership model:** Shared global catalog for products and recipes; users own only the entries they created (can edit/delete own entries only).
# processed: 2026-06-12 → CON-004
- **Offline:** Not in MVP scope; downloading meal plan and shopping list is a future consideration.
