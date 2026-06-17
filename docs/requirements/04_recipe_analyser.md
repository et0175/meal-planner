# Business requirements: recipe analyser

> **Decision (OQ-004):** Recipe import supports website URL and PDF for MVP. YouTube import is post-MVP.

- Maintain a recipe database with a breakdown into nutritional components and ingredient lines mapped to products.

## Search and filter

- The recipe list supports switching between **cards view** (default) and **list view**. In list view, recipes are shown in a table with columns: name, category, servings, kcal/serving, protein, fat, carbs.
- The recipe list may follow the layout shown in [recipe list reference](images/recipe_analyser/01_recipe_list.png) (see also [product analyser images](images/products-analyser/) for related patterns).
- Filter by recipe category, for example:

  Appetizers  
  Salads  
  Sandwiches  
  Breakfasts  
  Soups  
  Main courses  
  Snacks  
  Sauces  
  Desserts  
  Baked dishes  
  Drinks  
  Low-calorie  
  Low-budget  
  Kid-friendly dishes  

- Show only favorites or only the current user’s recipes.
- Filter recipes by diet type.
- Search for a specific recipe.
- Mark a recipe as a favorite.
- Mark a recipe as selected for the current week.
- Mark a recipe as selected for the next week.

> Note: products support independent "This week" and "Next week" flags. Recipes support the same two flags for parity. The unflagging and week-rollover rules defined in `01_products-database.md` apply equally to recipes.

## Adding a recipe

- Add a recipe manually.
- Add a recipe from external sources: website URL and PDF (MVP). YouTube is post-MVP.

## Recipe card

- Open a full recipe card.
- The card shows: image, ingredients summary, nutrition summary, number of servings, and calories per serving.

## Editing and deleting

- Users can update or delete only recipes they added.
- When editing a recipe, users can change ingredients (add, remove, or change amounts).
- A recipe with no ingredients can be saved. Nutrition shows all zeros; no grocery list entries are generated until ingredients are added.
- Users cannot delete a recipe that has planner assignments in the current or any future week. The deletion is blocked and the user is shown which days and meal slots the recipe is assigned to.
- Deleting a recipe that has assignments only in past weeks cascade-removes those past-week assignments silently.
