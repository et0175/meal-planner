# User Stories

Stories are grouped by module and keyed with module-prefixed IDs.
Full requirements: `Meal-forge/docs/requirements/`.

---

## Product Analyser (US-PA)

### US-PA-001 Browse products with nutrition breakdown
**As a** planner or nutritionist
**I want** to browse a product catalog where each product shows its nutritional breakdown
**So that** I can compare foods and use them in recipes and plans accurately.

**Acceptance criteria**
- Product list / catalog view is available with core nutrition fields per product.
- Opening or expanding a product shows a clear breakdown into nutritional components.

---

### US-PA-002 Filter products by category
**As a** user building a shopping or meal plan
**I want** to filter products by category
**So that** I can narrow the list to relevant items quickly.

**Acceptance criteria**
- Category filter controls are visible on the product browsing view.
- Applying a filter updates the list to only products in that category (or "all" when cleared).

---

### US-PA-003 Search for a product
**As a** user
**I want** to search for a product by name or relevant attributes
**So that** I can find a specific item without scrolling the whole catalog.

**Acceptance criteria**
- Search input is available on the product browsing experience.
- Results update to match the query; empty states are handled clearly.

---

### US-PA-004 Product browsing matches reference pattern
**As a** user familiar with nutrition catalogs
**I want** search and browse behavior to feel similar to the Calorizator-style product analyser
**So that** the workflow stays predictable.

**Acceptance criteria**
- Primary flows (browse, filter, search, open product) match the Calorizator interaction pattern described in requirements and reference images.

---

### US-PA-005 Add a custom product
**As a** user
**I want** to add a product that is not in the default database
**So that** my plans and logs reflect what I actually buy or eat.

**Acceptance criteria**
- Authenticated user can submit a new product with required fields including nutrition breakdown.
- New product appears in the catalog for that user.

---

### US-PA-006 Edit or delete own products only
**As a** user who added custom products
**I want** to update or delete only the products I created
**So that** I cannot change system-wide data by mistake.

**Acceptance criteria**
- Edit and delete actions are available only for products owned by the current user.
- System or shared products cannot be deleted by a non-admin user.

---

### US-PA-007 Mark product for the current week
**As a** user planning weekly meals
**I want** to mark a product as selected for the current week
**So that** it surfaces in weekly planning and shopping workflows.

**Acceptance criteria**
- User can toggle "selected for current week" on a product.
- State is visible in the UI and consumed by the meal planner and shopping list.

---

## Dietary Analyser (US-DA)

### US-DA-001 View supported diets
**As a** user choosing how to eat
**I want** to see a list of supported nutrition systems or diet patterns
**So that** I can pick one that matches my goals.

**Acceptance criteria**
- Module presents 12+ named diets (Mediterranean, plant-based/flexitarian, MIND, DASH, paleo, WW, intermittent fasting, keto, volumetrics, protein-focused, healthy fats, hydration, and similar).
- Each entry is selectable or openable for more detail.

---

### US-DA-002 Read diet description and macros guidance
**As a** user
**I want** each diet to include a short description and, where relevant, guidance on daily protein, fat, and carbohydrate split
**So that** I understand how to follow it in practice.

**Acceptance criteria**
- Every diet has a concise description visible in the UI.
- Macro split or intake guidance is shown where applicable, or explicitly marked as not applicable.

---

### US-DA-003 Mark product compatibility with a diet
**As a** user or nutritionist
**I want** to mark a product as acceptable for a given diet
**So that** filtering and planning respect dietary rules.

**Acceptance criteria**
- User can associate a product with one or more diets.
- Compatibility is persisted and visible when viewing the product.

---

### US-DA-004 Mark recipe compatibility with a diet
**As a** user or nutritionist
**I want** to mark a recipe as acceptable for a given diet
**So that** recipe search and meal planning can filter by diet.

**Acceptance criteria**
- User can associate a recipe with one or more diets.
- Compatibility is persisted and used by recipe search/filter.

---

## Recipe Analyser (US-RA)

### US-RA-001 Browse recipes with nutrition and ingredients
**As a** cook or planner
**I want** a recipe database where each recipe shows nutrition and ingredient lines linked to products
**So that** totals stay consistent with the product catalog.

**Acceptance criteria**
- Recipe list shows title and key metadata.
- Recipe detail shows ingredients mapped to products and a nutrition breakdown.

---

### US-RA-002 Recipe list layout reference
**As a** user
**I want** the recipe list layout to follow the agreed reference
**So that** the experience stays consistent with design.

**Acceptance criteria**
- List view matches the structure of the reference image in requirements.

---

### US-RA-003 Filter recipes by category
**As a** user
**I want** to filter recipes by category (appetizers, salads, sandwiches, breakfasts, soups, mains, snacks, sauces, desserts, baked dishes, drinks, low-calorie, low-budget, kid-friendly, and related)
**So that** I can find the right type of dish.

**Acceptance criteria**
- Category filter includes all categories from requirements.
- Selecting a category restricts the list accordingly.

---

### US-RA-004 Filter favorites or my recipes
**As a** user
**I want** to show only my favorite recipes or only recipes I created
**So that** I can work from a shortlist.

**Acceptance criteria**
- Toggle for "favorites only" shows only favorited recipes.
- Toggle for "my recipes only" shows only recipes owned by the current user.

---

### US-RA-005 Filter recipes by diet
**As a** user on a specific diet
**I want** to filter recipes by diet type
**So that** I only see compatible dishes.

**Acceptance criteria**
- Diet filter is available on the recipe browsing UI.
- Results respect diet compatibility set in the dietary analyser.

---

### US-RA-006 Search for a recipe
**As a** user
**I want** to search recipes by name or relevant fields
**So that** I can open a known recipe quickly.

**Acceptance criteria**
- Search input updates the recipe list based on the query.
- Clear empty and no-match states.

---

### US-RA-007 Mark recipe as favorite
**As a** user
**I want** to mark a recipe as a favorite
**So that** I can return to it without searching again.

**Acceptance criteria**
- Favorite action is available from list and/or detail view.
- State persists and appears in "favorites only" filter.

---

### US-RA-008 Mark recipe for the current week
**As a** user planning the week
**I want** to mark a recipe as selected for the current week
**So that** it appears in meal-prep summary and planner flows.

**Acceptance criteria**
- User can set or clear "selected for current week" on a recipe.
- Meal planner can consume this flag.

---

### US-RA-009 Add a recipe manually
**As a** user
**I want** to create a recipe by entering ingredients and instructions manually
**So that** family or proprietary dishes are in the system.

**Acceptance criteria**
- Manual creation form captures ingredients (with product linkage), steps, servings, and metadata needed for nutrition calculation.
- Saved recipe appears in "my recipes" and in search/browse.

---

### US-RA-010 Import a recipe from external sources
**As a** user
**I want** to add a recipe from a PDF, website, or YouTube
**So that** I do not have to retype content I already have.

**Acceptance criteria**
- User can start an import flow per supported source type (PDF, URL, YouTube).
- Imported content becomes an editable draft or saved recipe with ingredients and nutrition populated as accurately as the pipeline allows.

---

### US-RA-011 Open recipe card with full summary
**As a** user
**I want** to open a recipe card that shows image, ingredients summary, nutrition summary, servings, and calories per serving
**So that** I can decide whether to cook or plan it.

**Acceptance criteria**
- Recipe card shows all required fields; sensible placeholders when optional media is missing.

---

### US-RA-012 Edit or delete own recipes
**As a** user
**I want** to update or delete only recipes I added
**So that** shared or system recipes stay protected.

**Acceptance criteria**
- Edit and delete are only offered for user-owned recipes.
- Deletion does not break references unexpectedly.

---

### US-RA-013 Edit recipe ingredients
**As a** user editing my recipe
**I want** to add, remove, or change ingredient amounts
**So that** nutrition totals stay correct after changes.

**Acceptance criteria**
- Ingredient editor supports add, remove, and quantity change with product linkage.
- Nutrition summary updates after save.

---

## Personal Cabinet (US-PC)

### US-PC-001 Sign in and manage email and password
**As a** user
**I want** to sign in with email and password and change my credentials when needed
**So that** my account stays secure and reachable.

**Acceptance criteria**
- User can register or sign in with email and password.
- User can update email and/or password with validation and confirmation.

---

### US-PC-002 Set language preference
**As a** user
**I want** to choose my interface language (English or Ukrainian)
**So that** I can use the app in my preferred language.

**Acceptance criteria**
- Language setting is available in profile or settings.
- Changing language updates the UI without requiring a reinstall.

---

### US-PC-003 Set unit system
**As a** user
**I want** to choose metric or another supported unit system
**So that** weights and measures match how I cook and shop.

**Acceptance criteria**
- Unit system preference is stored on the user profile.
- Displayed quantities in relevant modules respect this preference.

---

### US-PC-004 Maintain demographic and body metrics
**As a** user
**I want** to record gender, age, weight, and body composition (where supported)
**So that** recommendations can be personalized.

**Acceptance criteria**
- Profile form includes gender, age, weight, and body composition fields.
- Values persist and are editable; invalid inputs are rejected.

---

### US-PC-005 Configure diet preferences and calorie corridor
**As a** user
**I want** to select diet preferences, see a recommended calorie range, and set protein, fat, and carbohydrate proportions
**So that** planning and tracking align with my goals.

**Acceptance criteria**
- User can select from diets or preferences (aligned with dietary analyser).
- System shows a recommended calorie corridor based on chosen rules or formulas.
- User can set or adjust macro proportions within allowed bounds.

---

### US-PC-006 Log meals and see daily nutrition summary
**As a** user
**I want** to log products and recipes I ate and see a daily nutrition total
**So that** I know whether I stayed on target.

**Acceptance criteria**
- User can add log entries for a day using products and/or recipes.
- Daily view aggregates nutrition (calories and relevant macros/micros).
- User can edit or remove incorrect log entries.

---

## Meal Planner (US-MP)

### US-MP-001 Choose planning date range
**As a** user planning meals
**I want** to set a from–to date range with the current week as the default
**So that** I can plan exactly the period I care about.

**Acceptance criteria**
- Date range defaults to the current calendar week.
- User can change start and end dates; the planner updates to that span.

---

### US-MP-002 See one card per day and a meal-prep summary
**As a** user
**I want** one card per day in the range plus a summary of all dishes in the period
**So that** I see both the weekly pool and the per-day layout.

**Acceptance criteria**
- Each day in the selected range renders as its own card.
- A meal-prep summary section lists all dishes planned for the entire selected period.

---

### US-MP-003 Weekly selections feed the summary
**As a** user
**I want** products and recipes I marked for the current week to appear in the summary area
**So that** I plan from the set I already shortlisted.

**Acceptance criteria**
- Items marked "selected for current week" in product and recipe modules appear in the planner summary.
- User can filter and select from these items.

---

### US-MP-004 Build summary with drag-and-drop or equivalent
**As a** user
**I want** to move products and recipes into the summary using drag-and-drop or another clear interaction
**So that** assembling the weekly pool feels fast.

**Acceptance criteria**
- User can place items into the summary via drag-and-drop with an accessible alternative.
- Summary content updates immediately.

---

### US-MP-005 Organize summary into menu sections
**As a** user
**I want** to group summary items into sections such as breakfasts, lunches, dinners, desserts, salads, and snacks
**So that** the weekly pool matches how I think about menus.

**Acceptance criteria**
- Default section set matches requirements; user can assign items to sections.
- User can add, delete, and rename summary sections.

---

### US-MP-006 Configure sections on day cards
**As a** user
**I want** each day card to start with breakfast, lunch, dinner, and snacks and let me change sections
**So that** unusual schedules still fit.

**Acceptance criteria**
- New day cards include breakfast, lunch, dinner, and snacks by default.
- User can add, delete, and rename sections on a day card.

---

### US-MP-007 Place items from summary onto days without removing from summary
**As a** user
**I want** to drag items from the summary onto a day and section while keeping them in the summary
**So that** the weekly pool stays visible as I assign meals.

**Acceptance criteria**
- Dragging from summary to a day card adds the item to that section without removing it from the summary.
- A section can hold zero or more items.

---

### US-MP-008 Reorder across days and sections
**As a** user
**I want** to drag items between day cards and between sections on the same day
**So that** I can rebalance the week quickly.

**Acceptance criteria**
- Moves between days update both source and target sections correctly.
- Moves within one day between sections behave consistently.

---

### US-MP-009 Select items without drag-and-drop
**As a** user who prefers clicks or keyboard
**I want** to assign items to days or summary without relying on drag-and-drop
**So that** the planner remains usable for everyone.

**Acceptance criteria**
- Non-drag selection path exists (menus, buttons, or pickers).
- Behavior matches: selections integrate with the summary as specified.

---

### US-MP-010 Remove items from day cards and sync summary
**As a** user
**I want** removing an item from a day to remove it from the summary only when it is not used on any other day
**So that** unused dishes drop out of the weekly pool automatically.

**Acceptance criteria**
- Deleting from a day card removes the item from that section only.
- If the item appears on no other day card, it is removed from the summary; otherwise it remains.

---

### US-MP-011 Set servings per dish on a day
**As a** user
**I want** to set the number of servings for each dish on a day card
**So that** nutrition and shopping quantities scale correctly.

**Acceptance criteria**
- Servings control exists per dish on a day card with sensible defaults (e.g., 1).
- Nutrition summary for the day respects servings multipliers.

---

### US-MP-012 Day card nutrition summary
**As a** user
**I want** each day card to show a nutrition summary for everything scheduled that day
**So that** I can see if daily targets are met before I shop.

**Acceptance criteria**
- Day card displays aggregated nutrition for all items in all sections for that day.
- Totals update when items or servings change.

---

### US-MP-013 Generate or refresh shopping list from plan
**As a** user
**I want** to generate a shopping list from the meal plan or refresh an existing list from the current plan
**So that** buying matches what I intend to cook.

**Acceptance criteria**
- User can create a shopping list from the current meal plan state.
- User can refresh an existing shopping list to reflect the latest plan without orphan items.
