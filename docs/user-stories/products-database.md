# User stories: products database

Requirements: [01_products-database.md](../requirements/01_products-database.md)

---

## US-PA-001 Browse products with nutrition breakdown

**As a** user or nutritionist  
**I want** to browse All products where each product shows its nutritional breakdown  
**So that** I can compare foods and use them in recipes and plans accurately.

**Acceptance criteria**

- [ ] A product list view is available; list view shows one row per product with columns: name, category, protein (g), fat (g), carbs (g), fiber (g), kcal, serving size.
- [ ] Opening or expanding a product shows a nutritional breakdown that includes at minimum protein, fat, carbohydrates, and calories.

---

## US-PA-002 Filter products by category

**As a** user building a shopping or meal plan  
**I want** to filter products by category  
**So that** I can narrow the list to relevant items quickly.

**Acceptance criteria**

- [ ] Category filter controls are visible **in list view only** (not in category cards view).
- [ ] Applying a filter updates the list to only products in that category (or “all” when cleared).
- [ ] Diet tag filter is available in list view; selecting a diet tag (e.g. “keto”) narrows the list to products carrying that tag.
- [ ] “This week” and “Next week” filter toggles are available in list view.

---

## US-PA-003 Search for a product

**As a** user  
**I want** to search for a product by name or relevant attributes  
**So that** I can find a specific item without scrolling the whole catalog.

**Acceptance criteria**

- [ ] A search input is available in list view (not in category cards view).
- [ ] Search matches **product name** (case-insensitive) and **diet tags** (e.g. typing "keto" returns all products tagged keto).
- [ ] Results update as the user types; an empty state is shown when no products match.
- [ ] Clearing the search restores the full unfiltered list.

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

- [ ] Authenticated user can submit a new product with required fields: name, category, base unit, serving amount, kcal, protein (g), fat (g), carbs (g).
- [ ] Fiber (g) is optional; if not provided it is stored as null and displayed as "—" in list view.
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
- [ ] Removing “This week” when the product has no calendar assignments removes it from the Weekly summary automatically.
- [ ] Removing “This week” when the product already has calendar assignments shows a confirmation prompt before any assignments are removed.
- [ ] Removing the “Next week” flag from a product that already has next-week calendar assignments shows a confirmation prompt before any assignments are removed. Confirming removes the next-week assignments; cancelling leaves the flag and assignments unchanged.
- [ ] On week rollover (each Monday), “Next week” flags auto-promote to “This week” and the product appears in the current week's planner summary (Lunch slot by default).
- [ ] User can filter the product list to show only “This week” or “Next week” items.

---

## US-PA-008 Switch between list view and category cards view

**As a** user  
**I want** to toggle All products between a category browsing layout and a table layout  
**So that** I can navigate by food group or compare nutrition in a table.

**Acceptance criteria**

- [ ] All products opens in **category cards view by default**.
- [ ] A toggle switches between category cards view and list view.
- [ ] Category cards view shows one card per product category; **no search bar or filter controls are visible in this view**.
- [ ] Clicking a category card navigates to the products in that category in list view, with the category filter pre-set to that category.
- [ ] List view shows products in a table with columns: name, category, protein (g), fat (g), carbs (g), fiber (g), kcal, and serving size (amount + unit where defined).
- [ ] A "back" or breadcrumb control returns the user to the category cards view. The category filter is cleared on return — the full category grid is shown (filter state is not preserved).

---

## US-PA-009 Browse products by category cards

**As a** user  
**I want** to see product categories as clickable cards, and see the products within a category when I click  
**So that** I can navigate to a specific food group quickly without scrolling through the full catalog.

Source: [01_products-database.md](../requirements/01_products-database.md)

**Acceptance criteria**

- [ ] In category cards view, one card is shown per distinct product category in the database.
- [ ] Each category card shows the category name and an item count badge.
- [ ] No search bar or filter controls are visible in category cards view.
- [ ] Clicking a category card navigates to the list view filtered to that category only; the category filter is pre-set.
- [ ] A "back" or breadcrumb control returns the user to the full category cards grid.

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

---

## US-PA-011 Sort the product list

**As a** user comparing products in list view  
**I want** to sort the product table by any column  
**So that** I can quickly find the highest-protein or lowest-calorie options.

Source: [01_products-database.md](../requirements/01_products-database.md)

**Acceptance criteria**

- [ ] Each column header in list view is clickable and toggles between ascending and descending sort order.
- [ ] The active sort column is visually indicated (e.g. arrow icon).
- [ ] Default sort order (before any column header is clicked) is alphabetical by name.
- [ ] Sorting applies to the currently visible set (after any active filters).

---

## US-PA-012 Define multiple alternative units per product with clear conversion labels

**As a** user adding or editing a product  
**I want** to define more than one alternative unit and see clearly labelled conversion fields  
**So that** the product can be measured accurately in every context where it is used.

Source: [01_products-database.md](../requirements/01_products-database.md)

**Acceptance criteria**

- [ ] The product form supports adding multiple alternative units (e.g. both "tbsp" and "cup" for the same product).
- [ ] Each alternative unit has its own gram-conversion input.
- [ ] When the selected unit is not a weight unit (not g or kg), the conversion input label reads **"grams per [unit name]"** (e.g. "grams per tbsp", "grams per cup").
- [ ] When the selected unit is a weight unit, no conversion label is needed (the value is the gram weight directly).
- [ ] Alternative units are saved and reflected in the product's units conversion table visible on the product detail card.
