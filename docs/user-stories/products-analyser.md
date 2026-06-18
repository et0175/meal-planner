# User stories: products analyser

Requirements: [02_products-analyser.md](../requirements/02_products-analyser.md)

---

## US-PAN-001 Open a blank analyser to build a custom ingredient list

**As a** user  
**I want** to open a dedicated products analyser view that starts empty  
**So that** I can compose an ad-hoc list of ingredients and instantly see their combined nutrition — without touching All products.

**Acceptance criteria**

- [ ] The analyser view is accessible from the main navigation.
- [ ] It opens with an empty list (no rows pre-populated).
- [ ] An "Add row" action is visible immediately.

---

## US-PAN-002 Select a product or recipe per row with live search

**As a** user building an ingredient list  
**I want** to type a product or recipe name in the first column and see matching suggestions from both the product database and the recipe catalog  
**So that** I can analyse any combination of standalone products and complete recipes.

**Acceptance criteria**

- [ ] Column 1 is a free-text search input that narrows results from a merged list of All products and All recipes as the user types.
- [ ] Search results are sorted: recently used items (recently planned or logged) first, then items owned by the current user, then all others alphabetically.
- [ ] Selecting a product suggestion pins it to the row; the nutrition columns populate from the product's per-serving values immediately.
- [ ] Selecting a recipe suggestion pins it to the row; the unit is fixed to "serving" and the nutrition columns populate from the recipe's total ingredient nutrition per serving.
- [ ] If no match is found among products, the user is offered an option to add a new product (see US-PAN-008).

---

## US-PAN-003 Choose unit and quantity per row

**As a** user  
**I want** to set the unit and quantity for each item in my list  
**So that** the nutrition reflects the actual amount I am using.

**Acceptance criteria**

- [ ] Column 2 is a unit dropdown. For **product rows**, it defaults to the product's base unit (typically **g**); only units for which the product has a defined gram conversion are listed (always includes the base unit and "serving"; additional units such as tbsp, tsp, or cup are shown only when the product has a conversion factor for them).
- [ ] For **recipe rows**, the unit dropdown offers **"serving"** (default) and **"grams"** as options; nutrition columns are scaled accordingly.
- [ ] Column 3 is a numeric quantity input.
- [ ] Changing unit or quantity immediately recalculates the row's nutrition columns.

---

## US-PAN-004 See calculated nutrition per row

**As a** user  
**I want** each row to show protein, fat, carbs, and kcal calculated from the selected product, unit, and quantity  
**So that** I know the nutritional contribution of each ingredient.

**Acceptance criteria**

- [ ] Columns for protein (g), fat (g), carbs (g), and kcal are populated automatically.
- [ ] Values update live whenever the product, unit, or quantity changes.
- [ ] Rows with no product selected show empty or zero nutrition columns.

---

## US-PAN-005 See total and per-100g nutrition for the whole list

**As a** user  
**I want** to see the summed nutrition for all rows and the equivalent per 100 g of total weight  
**So that** I can assess the full recipe or meal composition and compare it to other dishes.

**Acceptance criteria**

- [ ] A "Totals" row at the bottom sums all nutrient columns across all rows.
- [ ] A "Per 100 g" row shows nutrient values normalised to 100 g of total weight.
- [ ] Both rows update immediately when any row changes.

---

## US-PAN-006 Toggle weekly flags per row (mirrored with catalog)

**As a** user planning ahead  
**I want** to mark products in my analyser list as planned for this week or next week  
**So that** the flag is reflected in All products without leaving the analyser.

**Acceptance criteria**

- [ ] Each row shows "This week" and "Next week" toggle columns.
- [ ] Toggling either flag mirrors the same flag on the product in All products (bidirectional sync).
- [ ] The flag state is pre-filled from the catalog when a product is selected.

---

## US-PAN-007 Remove individual rows

**As a** user  
**I want** to remove a row I no longer need from the analyser list  
**So that** the totals reflect only the ingredients I care about.

**Acceptance criteria**

- [ ] Each row has a remove action (e.g. × button).
- [ ] Removing a row immediately updates the Totals and Per 100 g rows.
- [ ] Removing a row does not affect the weekly flags on the product in All products.

---

## US-PAN-008 Add a new product directly from the analyser

**As a** user  
**I want** to add a product to the database without leaving the analyser  
**So that** I can immediately include it in my current analysis session.

**Acceptance criteria**

- [ ] A "Add new product" action is available from within the analyser (e.g. triggered from the product search when no match is found, or via a standalone button).
- [ ] Completing the form adds the product to the database and pre-selects it in the current row.
- [ ] The new product is immediately visible to all users in All products.
- [ ] Only the creator can edit or delete the product they added.

---

## US-PAN-009 Weekly flags apply to both product rows and recipe rows

**As a** user analysing a mix of products and recipes  
**I want** "This week" and "Next week" flags to be available on both product rows and recipe rows  
**So that** I can schedule any item for the week directly from the analyser.

Source: [02_products-analyser.md](../requirements/02_products-analyser.md)

**Acceptance criteria**

- [ ] All rows — both product rows and recipe rows — show "This week" and "Next week" toggle columns.
- [ ] Toggling a flag on a **product row** mirrors the same flag on the product in All products (bidirectional sync).
- [ ] Toggling a flag on a **recipe row** mirrors the same flag on the recipe in the recipe catalog (bidirectional sync).
- [ ] All unflagging and week-rollover rules from the respective catalogs apply.
- [ ] The flag state is pre-filled from the catalog when an item is selected.
- [ ] Removing an item from a row clears the flag display without modifying the catalog flag.
