# User stories: product analyser

Requirements: [01_products-analyser.md](../requirements/01_products-analyser.md)

---

## US-PA-001 Browse products with nutrition breakdown

**As a** planner or nutritionist  
**I want** to browse a product catalog where each product shows its nutritional breakdown  
**So that** I can compare foods and use them in recipes and plans accurately.

**Acceptance criteria**

- [ ] A product list or catalog view is available with core nutrition fields per product (aligned with the product data model).
- [ ] Opening or expanding a product shows a clear breakdown into nutritional components.

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

## US-PA-004 Product browsing matches reference pattern

**As a** user familiar with nutrition catalogs  
**I want** search and browse behavior to feel similar to the Calorizator-style product analyser  
**So that** the workflow stays predictable (see requirements for reference screenshots).

**Acceptance criteria**

- [ ] Primary flows (browse, filter, search, open product) match the interaction pattern described in requirements and reference images where applicable.

---

## US-PA-005 Add a custom product

**As a** user  
**I want** to add a product that is not in the default database  
**So that** my plans and logs reflect what I actually buy or eat.

**Acceptance criteria**

- [ ] Authenticated user can submit a new product with required fields (including nutrition breakdown as defined by the product form).
- [ ] The new product appears in the catalog for that user (and globally if that is the product rule).

---

## US-PA-006 Edit or delete own products only

**As a** user who added custom products  
**I want** to update or delete only the products I created  
**So that** I cannot change system-wide data by mistake.

**Acceptance criteria**

- [ ] Edit and delete actions are available only for products owned by the current user.
- [ ] System or shared products cannot be deleted by a non-admin user (per product ownership rules).

---

## US-PA-007 Mark product for the current week

**As a** user planning weekly meals  
**I want** to mark a product as selected for the current week  
**So that** it surfaces in weekly planning and shopping workflows.

**Acceptance criteria**

- [ ] User can toggle or set a “selected for current week” state on a product.
- [ ] That state is visible in the UI and available to the meal planner or shopping list as required by downstream modules.
