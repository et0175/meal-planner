# Business requirements: recipe analyser

> **Decision (OQ-004):** Recipe import supports website URL and PDF for MVP. YouTube import is post-MVP.

---

## Functional requirements

### Recipe database

- Maintain a recipe database with a breakdown into nutritional components and ingredient lines mapped to products.
- Mark a recipe as a favorite.
- Mark a recipe as selected for the current week or the next week. The unflagging and week-rollover rules defined in `01_products-database.md` apply equally to recipes.

### Search and filter

- Filter by recipe category:

  Appetizers · Salads · Sandwiches · Breakfasts · Soups · Main courses · Snacks · Sauces · Desserts · Baked dishes · Drinks · Low-calorie · Low-budget · Kid-friendly dishes

- Show only favorites or only the current user's recipes.
- Filter recipes by diet type.
- Search for a specific recipe.

### Recipe card

- A full recipe card shows: image, ingredients summary, nutrition summary, number of servings, calories per serving.
- The card shows **preparation time** (when provided) and **step-by-step cooking instructions** (when provided).

### Adding recipes

- Add a recipe manually. The add form fields include: name, category, servings, preparation time *(optional)*, step-by-step cooking instructions *(optional)*, grams per serving, and an ingredient list.
- Add a recipe from external sources: website URL and PDF (MVP). YouTube is post-MVP.

### Editing and deleting

- Users can update or delete only recipes they added.
- When editing a recipe, users can change ingredients (add, remove, or change amounts).
- The nutrition summary **recalculates live** during editing — the totals update immediately as the user adds, removes, or changes ingredient quantities, without requiring a Save.
- A recipe with no ingredients can be saved; nutrition shows all zeros and no grocery list entries are generated until ingredients are added.
- Users cannot delete a recipe that has planner assignments in the current or any future week. The deletion is blocked and the user is shown which days and meal slots the recipe is assigned to.
- Deleting a recipe that has assignments only in past weeks cascade-removes those past-week assignments silently.

---

## UI / Prototype spec

- The recipe list opens in **category cards view by default**. Category cards view shows one card per recipe category; clicking a category card navigates to the recipes in that category with the category filter pre-set.
- The recipe list supports toggling between **list view** and **category cards view**. A dedicated cards view showing individual recipe cards is **not available**.
- In list view, recipes are shown in a table with columns: name, category, servings, kcal/serving, protein, fat, carbs, **fiber**.
- The recipe list may follow the layout shown in [recipe list reference](images/recipe_analyser/01_recipe_list.png) (see also [product analyser images](images/products-analyser/) for related patterns).
- On the recipe card, the nutrition summary is displayed as a **pie chart** with slices proportional to the caloric contribution of protein, fat, and carbs (matching the product card layout).
- The recipe card shows a **units conversion reference**: for the recipe's weight unit per serving (g) and for servings, listing the equivalent gram weight and scaled nutrition values.
- In the recipe **edit form**, a **live nutrition summary** is displayed at the **top of the form** (above the ingredient list). It recalculates continuously as ingredients are added, removed, or quantity-changed, so the user can see the nutritional impact of each change before saving.
