# User stories: products database

Requirements: [01_products-database.md](../requirements/01_products-database.md)

---

## US-PA-001 Browse products with nutrition breakdown

**As a** user or nutritionist  
**I want** to browse All products where each product shows its nutritional breakdown  
**So that** I can compare foods and use them in recipes and plans accurately.

**Acceptance criteria**

- [ ] A product list and cards view are available; list view shows one row per product with columns: name, category, protein (g), fat (g), carbs (g), kcal.
- [ ] Opening or expanding a product shows a nutritional breakdown that includes at minimum protein, fat, carbohydrates, and calories.

---

## US-PA-002 Filter products by category

**As a** user building a shopping or meal plan  
**I want** to filter products by category  
**So that** I can narrow the list to relevant items quickly.

**Acceptance criteria**

- [ ] Category filter controls are visible on the product browsing view.
- [ ] Applying a filter updates the list to only products in that category (or “all” when cleared).

---

## US-PA-003 Search for a product

**As a** user  
**I want** to search for a product by name or relevant attributes  
**So that** I can find a specific item without scrolling the whole catalog.

**Acceptance criteria**

- [ ] A search input is available on the product browsing experience.
- [ ] Results update to match the query and empty states are handled clearly.

---

## US-PA-004 Product browsing is non-navigational and composable

**As a** user familiar with nutrition catalogs  
**I want** search, filter, and browse to work together on a single screen without page navigation  
**So that** I can narrow down products quickly without losing my context.

**Acceptance criteria**

- [ ] Search narrows the product list as the user types, without requiring a form submission.
- [ ] Applying a category filter and typing a search query work in combination (both constraints are active simultaneously).
- [ ] The search input, category filter, and view toggle are all visible on the same screen as the product list, without navigating away.

---

## US-PA-005 Add a custom product

**As a** user  
**I want** to add a product that is not in the default database  
**So that** my plans and logs reflect what I actually buy or eat.

**Acceptance criteria**

- [ ] Authenticated user can submit a new product with required fields (including nutrition breakdown as defined by the product form).
- [ ] The new product is immediately visible to all users in All products.
- [ ] Only the creator can edit or delete their product (system-wide products are not editable by regular users).

---

## US-PA-006 Edit or delete own products only

**As a** user who added custom products  
**I want** to update or delete only the products I created  
**So that** I cannot change system-wide data by mistake.

**Acceptance criteria**

- [ ] Edit and delete actions are available only for products owned by the current user.
- [ ] System or shared products cannot be deleted by a non-admin user (per product ownership rules).
- [ ] Attempting to delete a product that is used as an ingredient in one or more recipes is blocked; the user sees a list of the recipes that reference the product.

---

## US-PA-007 Mark product for this week or next week

**As a** user planning weekly meals  
**I want** to mark a product as planned for the current week or the next week (independently)  
**So that** it surfaces in the appropriate weekly plan and can be filtered accordingly.

**Acceptance criteria**

- [ ] User can toggle “This week” and “Next week” flags on any product independently.
- [ ] Both flags are visible on product cards and in the list view.
- [ ] Marking “This week” adds the product to the Meal planner Weekly summary (Lunch slot by default).
- [ ] Removing “This week” when the product has no day-card assignments removes it from the Weekly summary automatically.
- [ ] Removing “This week” when the product already has day-card assignments shows a confirmation prompt before any assignments are removed.
- [ ] On week rollover (each Monday), “Next week” flags auto-promote to “This week” and the product appears in the current week's planner summary (Lunch slot by default).
- [ ] User can filter the product list to show only “This week” or “Next week” items.

---

## US-PA-008 Switch between list, cards, and category cards views

**As a** user  
**I want** to toggle All products between a card layout, a table layout, and a category browsing layout  
**So that** I can browse visually, compare nutrition in a table, or quickly jump to a category.

**Acceptance criteria**

- [ ] A three-way toggle control switches between list view, cards view, and category cards view.
- [ ] List view shows products in a table with columns: name, category, protein (g), fat (g), carbs (g), fiber (g), kcal, and serving size (amount + unit where defined).
- [ ] Cards view shows product cards with image, macros strip, and diet tags.
- [ ] Category cards view shows one card per product category; clicking a category card displays all products in that category.
- [ ] Returning from a category in category cards view shows the full category list again.

---

## US-PA-009 Browse products by category cards

**As a** user  
**I want** to see product categories as clickable cards, and see the products within a category when I click  
**So that** I can navigate to a specific food group quickly without scrolling through the full catalog.

Source: [01_products-database.md](../requirements/01_products-database.md)

**Acceptance criteria**

- [ ] In category cards view, one card is shown per distinct product category in the database.
- [ ] Each category card shows the category name and an item count badge.
- [ ] Clicking a category card shows the products in that category (filtered list or cards view).
- [ ] A "back" or breadcrumb control returns the user to the full category cards grid.
- [ ] Active search and diet filters still apply inside the category view.

---

## US-PA-010 View detailed product card with nutrient pie chart and units conversion

**As a** user  
**I want** to click on a product and see a detailed breakdown with a pie chart and units conversion table  
**So that** I can understand the macro balance at a glance and know exactly how much I need in different measurement units.

Source: [01_products-database.md](../requirements/01_products-database.md)

**Acceptance criteria**

- [ ] Clicking a product in any view (list, cards, or category cards) opens a product detail panel or modal.
- [ ] The detail view shows a **pie chart** with slices proportional to the caloric contribution of protein, fat, and carbs.
- [ ] The detail view shows absolute macro values: protein (g), fat (g), carbs (g), kcal, fiber (g) if applicable.
- [ ] The detail view shows a **units conversion table** listing, for each applicable unit (g, ml, pc, tbsp, tsp, serving), the equivalent gram weight and scaled nutrition values.
- [ ] The detail view is dismissible (modal close or back navigation).
