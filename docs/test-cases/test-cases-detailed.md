# Detailed Test Cases — Meal Forge MVP Prototype

> ⚠️ **Deprecated.** This monolithic file has been split into per-module files. Use the index at **[README.md](README.md)** instead. This file is kept as a historical reference only and will not be updated going forward.

> [`prototype-test-cases.md`](prototype-test-cases.md) is a separate legacy prototype results log.

**App:** `http://localhost:3001`  
**Scope:** UI prototype — no persistence, no user management. All data is in-memory dummy data.  
**Test data source:** [`../test-data/test-data.json`](../test-data/test-data.json) · [`../test-data/test-data.xlsx`](../test-data/test-data.xlsx)  
**Requirements:** [`../requirements/`](../requirements/) · **User stories:** [`../user-stories/`](../user-stories/)  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested

---

## Table of contents

1. [TC-NAV — Navigation](#tc-nav--navigation)
2. [TC-PRD — Products database](#tc-prd--products-database)
3. [TC-PAN — Products analyser](#tc-pan--products-analyser)
4. [TC-RCP — Recipe analyser](#tc-rcp--recipe-analyser)
5. [TC-DIT — Dietary analyser](#tc-dit--dietary-analyser)
6. [TC-PLN — Meal planner: weekly summary](#tc-pln--meal-planner-weekly-summary)
7. [TC-DAY — Meal planner: day cards](#tc-day--meal-planner-day-cards)
8. [TC-CAL — Meal planner: calendar](#tc-cal--meal-planner-calendar)
9. [TC-SHP — Shopping list](#tc-shp--shopping-list)
10. [TC-PRF — Personal cabinet / profile](#tc-prf--personal-cabinet--profile)
11. [TC-MLT — Meal tracking](#tc-mlt--meal-tracking)
12. [TC-AUTH — Authentication](#tc-auth--authentication)

---

## TC-NAV — Navigation

**Requirement:** Navigation structure (implied by all modules)  
**User stories:** [`navigation.md`](../user-stories/navigation.md) — US-NAV-001 – US-NAV-005  
**Test data:** App seed state (all 27 products + 12 recipes pre-loaded)

---

### TC-NAV-001: Sidebar shows all seven navigation items
**AC:** US-NAV-001 — sidebar contains exactly 7 items in defined order  
**Priority:** High

**Preconditions:** App loaded at `http://localhost:3001`

**Steps:**
1. Open the app.
2. Observe the sidebar.

**Expected result:**
- Sidebar contains exactly 7 items in order: **Planner, Products, Products analyser, Recipes, Diets, Shopping list, Profile**
- Shopping list is a top-level item, not nested inside Planner
- Products analyser is a top-level item, not nested inside Products
- All 7 labels are visible without scrolling

**Status:** ✅

---

### TC-NAV-002: Default view is Planner
**AC:** US-NAV-002 — app root opens Planner with Planner sidebar item active  
**Priority:** High

**Steps:**
1. Open app at root URL.

**Expected result:**
- Planner view content is shown
- "Planner" nav item has active/highlighted styling

**Status:** ✅

---

### TC-NAV-003: Active nav item is highlighted
**AC:** US-NAV-003 — active sidebar item has distinct visual state; only one active at a time  
**Priority:** Medium

**Steps:**
1. Click **Products** in the sidebar.
2. Click **Recipes** in the sidebar.
3. Click **Diets** in the sidebar.

**Expected result (each step):**
- Clicked item receives active CSS styling (highlighted background or border)
- Previous item loses active styling
- Content area switches to the correct view

**Status:** ✅

---

### TC-NAV-004: Topbar reflects the current view name
**AC:** US-NAV-004 — topbar heading matches active module name; updates on navigation  
**Priority:** Medium

**Steps:**
1. Click each of the 6 nav items in sequence.

**Expected result:**
- The `<h1>` or topbar title matches the clicked view label each time

**Status:** ✅

---

### TC-NAV-005: Topbar summary metrics update when plan changes
**AC:** US-NAV-005 — topbar plan metrics (kcal, item count) update immediately when assignments change  
**Priority:** Medium

**Preconditions:** Planner view is active; seed data loaded (8 assignments from `plannerSeeds` in test-data.json)

**Steps:**
1. Note the current kcal total in the topbar.
2. In Planner > Weekly summary, increase servings for **Berry overnight oats** (r-001) on Monday from 1 to 2.
3. Observe the topbar.

**Expected result:**
- kcal total increases by 385 (one additional serving of Berry overnight oats)
- Count of planned items and/or placements updates without page reload

**Status:** ✅

---

## TC-PRD — Products database

**Requirement:** [`01_products-database.md`](../requirements/01_products-database.md)  
**User stories:** [`products-database.md`](../user-stories/products-database.md)  
**Test data:** Products p-001 – p-027 from test-data.json

---

### TC-PRD-001: Products view shows only products
**AC:** US-PA-001 — product list is scoped to products only  
**Priority:** High

**Steps:**
1. Click **Products** in the sidebar.

**Expected result:**
- Only items with `kind = product` are shown
- No recipe cards are visible (e.g. "Berry overnight oats" must not appear)
- All 27 products from seed data visible (or a count badge confirms 27)

**Status:** ✅

---

### TC-PRD-002: Cards view shows image, macros, and diet tags
**AC:** US-PA-001 — cards view fields  
**Priority:** High

**Preconditions:** Products view open, cards view active

**Steps:**
1. Locate **Greek yogurt** (p-001) in the cards view.
2. Inspect the card.

**Expected result:**
- Card shows: name "Greek yogurt", category "Dairy", serving "150 g"
- Macros visible: kcal 88, protein 15 g, fat 0.6 g, carbs 5.4 g
- Diet tags visible: mediterranean, plant-based, keto, protein-focused

**Status:** ✅

---

### TC-PRD-003: Switch to list view
**AC:** US-PA-008 — list view shows name, category, protein, fat, carbs, kcal columns  
**Priority:** Medium

**Steps:**
1. In Products view, click the **list-view toggle** in the control band.

**Expected result:**
- Layout switches to a table
- Columns visible: Name, Category, Protein (g), Fat (g), Carbs (g), Fiber (g), kcal, Serving size
- **Atlantic salmon** (p-005) row shows: Fish, 20 g, 13 g, 0 g, 0 g, 208, 100 g

**Status:** ✅

---

### TC-PRD-004: Switch back to cards view preserves filter state
**AC:** US-PA-008 — toggle is reversible; filters persist  
**Priority:** Medium

**Steps:**
1. Set category filter to **Dairy**.
2. Switch to list view — confirm only Dairy products show.
3. Switch back to cards view.

**Expected result:**
- Cards view shows only Dairy products (Greek yogurt, Whole milk, Cheddar cheese, Butter, Whole eggs — 5 items)
- Filter dropdown still shows "Dairy" selected

**Status:** ✅

---

### TC-PRD-005: Search filters by name (case-insensitive)
**AC:** US-PA-003 — search updates results as user types  
**Priority:** High

**Steps:**
1. Type `salmon` in the search box.

**Expected result:**
- Only **Atlantic salmon** (p-005) visible
- Result count: 1

**Steps (case check):**
2. Clear search, type `SALMON`.

**Expected result:**
- Same result — **Atlantic salmon** shown (case-insensitive)

**Status:** ✅

---

### TC-PRD-006: Search filters by diet tag
**AC:** US-PA-003 — search covers relevant attributes  
**Priority:** Medium

**Steps:**
1. Type `keto` in the search box.

**Expected result:**
- Products tagged with "keto" shown: Greek yogurt, Cheddar cheese, Butter, Atlantic salmon, Tuna in water, Sardines, Baby spinach, Broccoli, Avocado, Chicken breast, Almonds, Olive oil, Whole eggs (13 items — verify against test-data.json `dietTags` arrays)
- Products with no keto tag (e.g. Banana, Brown rice) are hidden

**Status:** ✅

---

### TC-PRD-007: Search + category filter combine
**AC:** US-PA-004 — filters work in combination  
**Priority:** High

**Steps:**
1. Set category filter to **Fish**.
2. Type `tuna` in the search box.

**Expected result:**
- Only **Tuna in water** (p-006) visible
- Both constraints active simultaneously

**Steps:**
3. Clear search, keep category = Fish.

**Expected result:**
- All 3 Fish products shown: Atlantic salmon, Tuna in water, Sardines

**Status:** ✅

---

### TC-PRD-008: Empty search shows all products
**AC:** US-PA-003 — clearing search restores full list  
**Priority:** Medium

**Steps:**
1. Type `oats` — 1 result.
2. Clear the search box.

**Expected result:**
- All 27 products shown (or full unfiltered count)

**Status:** ✅

---

### TC-PRD-009: Category filter "All" shows everything
**AC:** US-PA-002 — "All" resets category filter  
**Priority:** Medium

**Steps:**
1. Select **Dairy** from category filter — 5 items shown.
2. Select **All** from category filter.

**Expected result:**
- All products visible again

**Status:** ✅

---

### TC-PRD-010: Diet filter restricts list
**AC:** US-PA-002 extension — diet tag filter  
**Priority:** Medium

**Steps:**
1. Select **Keto** from the diet filter dropdown.

**Expected result:**
- Only products tagged `keto` shown (see TC-PRD-006 for expected set)
- Products not tagged keto (e.g. Rolled oats, Brown rice, Banana) hidden

**Status:** ✅

---

### TC-PRD-011: "Mine" filter shows only user-added products
**AC:** US-PA-006 — ownership visibility  
**Priority:** Medium

**Steps:**
1. Toggle the **Mine** filter button.

**Expected result:**
- Only **Hemp seeds** (p-026, `isUserAdded: true`) and any other user-owned products visible
- System products (isUserAdded: false) hidden

**Status:** ✅

---

### TC-PRD-012: Mark product "This week"
**AC:** US-PA-007 — "This week" flag adds product to planner Lunch slot  
**Priority:** High

**Preconditions:** **Brown rice** (p-009) has `thisWeek: false`

**Steps:**
1. Click **"This week"** on Brown rice card.
2. Navigate to **Planner > Weekly summary**.

**Expected result:**
- Brown rice card shows "This week" badge active
- Brown rice appears in the **Lunch** meal slot of the weekly summary
- Planner topbar kcal total increases

**Status:** ✅

---

### TC-PRD-013: Untoggle "This week" — no day assignments → auto-removed from planner
**AC:** US-PA-007 — unflagging with no day-card assignments removes from summary automatically  
**Priority:** High

**Preconditions:** Brown rice (p-009) marked "This week" (follow TC-PRD-012); no day-card assignment added

**Steps:**
1. Click **"This week"** on Brown rice to untoggle.

**Expected result:**
- "This week" badge removed from card
- Brown rice no longer appears in Planner weekly summary
- No confirmation prompt shown (no day assignments exist)

**Status:** ✅

---

### TC-PRD-014: Untoggle "This week" — with day assignments → confirmation prompt
**AC:** US-PA-007 — unflagging with day-card assignments requires confirmation  
**Priority:** High

**Preconditions:** **Rolled oats** (p-008, `thisWeek: true`) has been added to a day card slot (e.g. Monday Breakfast)

**Steps:**
1. Click **"This week"** on Rolled oats to untoggle.

**Expected result:**
- Confirmation prompt appears before removing assignments
- If user cancels: flag remains, day assignment preserved
- If user confirms: flag removed, day assignment removed

**Status:** ✅

---

### TC-PRD-015: "Next week" flag is independent of "This week"
**AC:** US-PA-007 — both flags can be set independently  
**Priority:** Medium

**Preconditions:** **Quinoa** (p-010) has both flags false

**Steps:**
1. Click **"Next week"** on Quinoa — only next week flag toggled.
2. Observe card badges.
3. Click **"This week"** on Quinoa.
4. Observe card badges.

**Expected result:**
- After step 1: "Next week" badge shown; "This week" badge absent
- After step 3: Both "This week" and "Next week" badges visible simultaneously
- Quinoa appears in Planner when "Next week" filter is active

**Status:** ✅

---

### TC-PRD-016: Add a new product (VALID-PRD-001)
**AC:** US-PA-005 — user can add a product; immediately visible to all  
**Priority:** High

**Test data:** `formInputs.productForm.valid[0]` (VALID-PRD-001)
```
name: Hemp protein powder
category: Nuts & Seeds
unit: g
servingAmount: 30
kcal: 166, protein: 9.5, fat: 14.6, carbs: 2.6
dietTags: plant-based, protein-focused
```

**Steps:**
1. Click **"Add product"** button.
2. Fill in the form with VALID-PRD-001 values.
3. Submit.

**Expected result:**
- Modal closes
- "Hemp protein powder" appears in the product list immediately
- Card shows correct macros and diet tags
- **Mine** filter shows the new product
- Product count increases by 1

**Status:** ✅

---

### TC-PRD-017: Add product — empty name is rejected (INVALID-PRD-001)
**AC:** US-PA-005 — required fields enforced  
**Priority:** High

**Test data:** `formInputs.productForm.invalid[0]` (INVALID-PRD-001) — name: `""`

**Steps:**
1. Click **"Add product"**.
2. Leave name empty, fill all other fields with valid values.
3. Click submit.

**Expected result:**
- Form does not submit
- Validation error shown on the name field
- No product added to the list

**Status:** ✅

---

### TC-PRD-018: Add product — negative values rejected (INVALID-PRD-002)
**AC:** US-PA-005 — numeric fields must be non-negative  
**Priority:** Medium

**Test data:** `formInputs.productForm.invalid[1]` (INVALID-PRD-002) — servingAmount: -1, kcal: -10

**Steps:**
1. Click **"Add product"**.
2. Enter name "Bad macros", category "Grains", unit "g".
3. Enter servingAmount = `-1`, kcal = `-10`, protein = `-5`, fat = `-1`, carbs = `-2`.
4. Submit.

**Expected result:**
- Form blocked by validation errors on the negative numeric fields
- Product not saved

**Status:** ✅

---

### TC-PRD-019: Add product — edge case: all-zero nutrition (EDGE-PRD-001)
**AC:** US-PA-005 — all-zero nutrition is valid (e.g. pure water)  
**Priority:** Low

**Test data:** `formInputs.productForm.edgeCases[0]` (EDGE-PRD-001)
```
name: A, category: Produce, unit: g, servingAmount: 1
kcal: 0, protein: 0, fat: 0, carbs: 0
```

**Steps:**
1. Add product with all-zero nutrition.
2. Submit.

**Expected result:**
- Product saved; card shows "0 kcal" without error

**Status:** ✅

---

### TC-PRD-020: Edit own product
**AC:** US-PA-006 — edit available only for owned products  
**Priority:** High

**Preconditions:** **Hemp seeds** (p-026, `isUserAdded: true, userId: "u-001"`) is in the list

**Steps:**
1. Locate Hemp seeds card (or add it via TC-PRD-016 first).
2. Click **edit** on the Hemp seeds card.
3. Change the `kcal` value from 166 to 180.
4. Save.

**Expected result:**
- Card updates to show 180 kcal
- System products (e.g. Greek yogurt p-001) do not show edit/delete controls

**Status:** ✅

---

### TC-PRD-021: Delete own product — not used in any recipe → succeeds
**AC:** US-PA-006 — delete succeeds when product is not referenced by any recipe  
**Priority:** High

**Preconditions:** **Hemp seeds** (p-026) is user-added and used in zero recipes

**Steps:**
1. Click **delete** on Hemp seeds.
2. Confirm deletion if prompted.

**Expected result:**
- Hemp seeds removed from product list immediately
- Product count decreases by 1
- Mine filter no longer shows Hemp seeds

**Status:** ✅

---

### TC-PRD-022: Delete own product — used in a recipe → blocked
**AC:** US-PA-006 — deletion blocked when product is an ingredient in one or more recipes  
**Priority:** High

**Test data:** **Whole eggs** (p-027, `isUserAdded: false`) is used in:
- Avocado toast (r-002): 2 pc
- Spinach omelette (r-003): 2 pc

> Note: In the prototype, p-027 is a system product (not user-added). To test this, add a new product, then add it as an ingredient to a recipe, then attempt deletion.

**Steps (workaround for prototype):**
1. Add a new product "Test product X".
2. Edit recipe **Turkey meatballs** (r-009, owned by u-001), add "Test product X" as an ingredient.
3. Navigate back to Products.
4. Delete "Test product X".

**Expected result:**
- Deletion blocked
- Error message lists the recipes that reference the product (at minimum: "Turkey meatballs")
- Product remains in the list

**Status:** ✅

---

### TC-PRD-023: Search resets when switching to Recipes view
**AC:** US-PA-004 — search state is scoped to the current view  
**Priority:** Medium

**Steps:**
1. In Products, type `salmon` — 1 result.
2. Click **Recipes** in sidebar.
3. Click **Products** again.

**Expected result:**
- Search box is empty
- All products shown (no lingering filter)

**Status:** ✅

---

### TC-PRD-024: Category cards view shows one card per category
**AC:** US-PA-009 — category cards view with item counts  
**Priority:** High

**Steps:**
1. In Products view, click the **CAT** (category cards) toggle button.

**Expected result:**
- One card per distinct category (Dairy, Fish, Grains, Produce, Meat, Legumes, Nuts & Seeds, Condiments, Other)
- Each card shows category name and the count of products in that category
- No individual products shown in the grid — only category cards

**Status:** ✅

---

### TC-PRD-025: Click category card to see its products
**AC:** US-PA-009 — clicking category card filters to that category  
**Priority:** High

**Steps:**
1. In category cards view, click the **Dairy** card.

**Expected result:**
- Transitions to a filtered product list showing only Dairy products (Greek yogurt, Whole milk, Cheddar cheese, Butter, Whole eggs — 5 items)
- A "← All categories" breadcrumb is visible to return to the category grid

**Steps:**
2. Click "← All categories".

**Expected result:**
- Full category cards grid is shown again

**Status:** ✅

---

### TC-PRD-026: Click product to open detail card with pie chart and units conversion
**AC:** US-PA-010 — product detail with nutrient pie chart and units conversion table  
**Priority:** High

**Steps:**
1. In Products view (any browse mode), click on **Greek yogurt** (p-001).

**Expected result:**
- A product detail modal opens
- A CSS pie chart (conic-gradient circle) shows caloric proportions for protein, fat, and carbs
- Macro values shown with percentages
- Units conversion table shows at minimum 100 g row and serving row
- Close button dismisses the modal

**Status:** ✅

---

## TC-PAN — Products analyser

**Requirement:** [`02_products-analyser.md`](../requirements/02_products-analyser.md)  
**Note:** Products analyser is not yet implemented in the prototype. All cases below are 🚫.

---

### TC-PAN-001: Analyser opens empty
**AC:** Spreadsheet-like list view, empty by default  
**Priority:** High  
**Status:** 🚫

### TC-PAN-002: Add a row — product selector filters as user types
**AC:** Column 1 narrows list from All products  
**Priority:** High  
**Test data:** Type "Salmon" → should suggest **Atlantic salmon** (p-005)  
**Status:** 🚫

### TC-PAN-003: Unit dropdown defaults to "g"
**AC:** Column 2 defaults to g; options: g, ml, pc, tbsp, tsp, serving  
**Priority:** Medium  
**Status:** 🚫

### TC-PAN-004: Nutrition calculated live
**AC:** Calculated columns (protein, fat, carbs, kcal) update immediately on any change  
**Priority:** High  
**Test data:** Select Atlantic salmon (p-005), unit=g, qty=150 → expected: protein 30 g, fat 19.5 g, carbs 0, kcal 312  
**Status:** 🚫

### TC-PAN-005: Totals row sums all rows
**AC:** Totals row shows sum of each nutrient column  
**Priority:** High  
**Test data:** Row 1: Atlantic salmon 100 g (kcal 208); Row 2: Greek yogurt 150 g (kcal 88) → total kcal = 296  
**Status:** 🚫

### TC-PAN-006: Per-100 g row normalises totals
**AC:** "Per 100 g" row shows nutrients scaled to 100 g of total weight  
**Priority:** Medium  
**Status:** 🚫

### TC-PAN-007: Remove a row — totals update
**AC:** Row removal updates totals immediately; catalog flags unaffected  
**Priority:** Medium  
**Status:** 🚫

### TC-PAN-008: Add new product from within analyser
**AC:** User can add a product without leaving the analyser  
**Priority:** Low  
**Status:** 🚫

### TC-PAN-009: Select a recipe as a row item
**AC:** US-PAN-002 — merged product + recipe search; recipe pins with unit = "serving"  
**Priority:** High  
**Test data:** Type "Berry" → should suggest **Berry overnight oats** (r-001)

**Steps:**
1. Open Products analyser and add a row.
2. Type `berry` in Column 1.
3. Select **Berry overnight oats** from the suggestions.

**Expected result:**
- Row shows "Berry overnight oats" pinned in Column 1 (with "recipe" label)
- Column 2 (Unit) shows "serving" (read-only/fixed — not a dropdown)
- Column 3 (Quantity) defaults to 1
- Nutrition columns populate: kcal 385, protein 15 g, fat 8 g, carbs 65 g
- No "TW" / "NW" flag buttons shown for this row (only shown for product rows)
**Status:** ✅

### TC-PAN-010: Recently used items appear first in analyser search
**AC:** US-PAN-002 — recently planned/logged items sorted first  
**Priority:** Medium  

**Preconditions:** Seed assignments include Berry overnight oats (r-001) and Chicken quinoa bowl (r-004) in current week

**Steps:**
1. Open Products analyser and add a row.
2. Clear the search field and observe the default suggestions (or type a single generic character).

**Expected result:**
- Berry overnight oats and Chicken quinoa bowl (recently planned) appear at or near the top of the suggestions
- Items not used recently appear below
**Status:** 🚫

---

### TC-PAN-011: Analyser week-flag mirrors catalog (bidirectional sync)
**AC:** US-PAN-006 — toggling "This week" / "Next week" in analyser reflects in All products, and vice versa  
**Priority:** High

**Preconditions:** **Broccoli** (p-013) has `thisWeek: false`, `nextWeek: false`

**Steps (analyser → catalog):**
1. Open Products analyser.
2. Add a row and select **Broccoli**.
3. In the row, toggle **"This week"** ON.
4. Navigate to **Products** and locate Broccoli.

**Expected result (analyser → catalog):**
- Broccoli shows "This week" flag as active in the Products list / card
- No duplicate entries; the state is mirrored, not duplicated

**Steps (catalog → analyser):**
5. In Products, toggle Broccoli **"Next week"** ON.
6. Return to Products analyser; the Broccoli row still exists in the session.

**Expected result (catalog → analyser):**
- Broccoli row in analyser now shows "Next week" flag as active
- "This week" flag still active (both flags can be set independently)

**Status:** 🚫

---

## TC-RCP — Recipe analyser

**Requirement:** [`04_recipe_analyser.md`](../requirements/04_recipe_analyser.md)  
**User stories:** [`recipe-analyser.md`](../user-stories/recipe-analyser.md)  
**Test data:** Recipes r-001 – r-012 from test-data.json

---

### TC-RCP-001: Recipes view shows only recipes
**AC:** US-RA-001 — recipe list is scoped to recipes  
**Priority:** High

**Steps:**
1. Click **Recipes** in the sidebar.

**Expected result:**
- All 12 seed recipes visible
- No product items appear (e.g. "Greek yogurt" must not appear)

**Status:** ✅

---

### TC-RCP-002: Each recipe card shows title, category, and macro summary
**AC:** US-RA-002 — list is scannable without opening each item  
**Priority:** High

**Steps:**
1. Locate **Berry overnight oats** (r-001) in the list.
2. Inspect the card without opening it.

**Expected result:**
- Visible without opening: name, category "Breakfasts", kcal 385 (or macro strip showing 15g protein / 8g fat / 65g carbs)
- Heart icon visible (r-001 has `favorite: true`)

**Status:** ✅

---

### TC-RCP-003: Search filters recipes by name
**AC:** US-RA-006 — search updates list  
**Priority:** High

**Steps:**
1. Type `oats` in the search box.

**Expected result:**
- Only **Berry overnight oats** (r-001) visible
- All other recipes hidden

**Status:** ✅

---

### TC-RCP-004: Category filter — "Soups"
**AC:** US-RA-003 — category filter restricts list  
**Priority:** High

**Steps:**
1. Select **Soups** from the category dropdown.

**Expected result:**
- Only **Lentil tomato soup** (r-006) and **Broccoli cheddar soup** (r-007) visible

**Status:** ✅

---

### TC-RCP-005: Diet filter — "Plant-based"
**AC:** US-RA-005 — diet filter shows only compatible recipes  
**Priority:** Medium

**Steps:**
1. Select **Plant-based** from the diet filter.

**Expected result:**
- Recipes tagged `plant-based` shown: Berry overnight oats, Lentil tomato soup, Chickpea curry, Chia pudding (verify against test-data.json)
- Recipes without the tag (e.g. Spinach omelette, Greek salad) hidden

**Status:** ✅

---

### TC-RCP-006: Mark recipe as favourite
**AC:** US-RA-007 — favourite can be toggled; state persists in session  
**Priority:** Medium

**Preconditions:** **Lentil tomato soup** (r-006) has `favorite: false`

**Steps:**
1. Click the heart icon on Lentil tomato soup.
2. Observe the icon state.

**Expected result:**
- Heart icon becomes filled/active
- r-006 now appears when "Favourites" filter is active

**Steps:**
3. Click the heart again to unfavourite.

**Expected result:**
- Heart returns to inactive state
- r-006 no longer in favourites filter

**Status:** ✅

---

### TC-RCP-007: Favourites-only filter
**AC:** US-RA-004 — toggle shows only favourited recipes  
**Priority:** Medium

**Preconditions:** Seed data: r-001 (Berry overnight oats) and r-004 (Chicken quinoa bowl) have `favorite: true`

**Steps:**
1. Click **Favourites** toggle.

**Expected result:**
- Only Berry overnight oats and Chicken quinoa bowl shown (2 items)
- All non-favourited recipes hidden

**Status:** ✅

---

### TC-RCP-008: Mine filter — user-owned recipes only
**AC:** US-RA-004 — "mine" toggle shows only user-created recipes  
**Priority:** Medium

**Preconditions:** **Turkey meatballs** (r-009) has `isUserAdded: true, userId: "u-001"`

**Steps:**
1. Click **Mine** toggle.

**Expected result:**
- Only Turkey meatballs shown (1 item from seed data)
- All system-owned recipes hidden

**Status:** ✅

---

### TC-RCP-009: Open recipe detail card
**AC:** US-RA-011 — card shows image, ingredients, nutrition, servings, kcal/serving  
**Priority:** High

**Steps:**
1. Click the card image or title of **Chicken quinoa bowl** (r-004).

**Expected result:**
- Detail modal or expanded card opens
- Visible: image (or placeholder), servings "1", kcal/serving "450"
- Ingredients listed: Chicken breast 150 g, Quinoa 85 g, Baby spinach 30 g, Cherry tomatoes 50 g, Olive oil 0.5 tbsp
- Nutrition summary: protein 38 g / fat 12 g / carbs 42 g

**Status:** ✅

---

### TC-RCP-010: "This week" flag on recipe
**AC:** US-RA-008 — "This week" adds recipe to Planner Lunch slot  
**Priority:** High

**Preconditions:** **Lentil tomato soup** (r-006) has `thisWeek: false`

**Steps:**
1. Click **"This week"** on Lentil tomato soup.
2. Navigate to **Planner > Weekly summary**.

**Expected result:**
- Lentil tomato soup appears in the **Lunch** slot of the weekly summary
- "This week" badge active on the recipe card

**Status:** ✅

---

### TC-RCP-011: "Next week" flag independent of "This week"
**AC:** US-RA-008 — both flags work independently, same rules as products  
**Priority:** Medium

**Preconditions:** **Chia pudding** (r-012) has both flags false

**Steps:**
1. Click **"Next week"** on Chia pudding only.

**Expected result:**
- "Next week" badge shown
- No "This week" badge
- Chia pudding appears in Next week filter

**Status:** ✅

---

### TC-RCP-012: Add recipe manually (VALID-RCP-001)
**AC:** US-RA-009 — manual recipe creation  
**Priority:** High

**Test data:** `formInputs.recipeForm.valid[0]` (VALID-RCP-001)
```
name: Simple tuna salad
category: Salads
servings: 1
ingredients: Tuna in water 100 g, Cherry tomatoes 80 g
dietTags: keto, mediterranean
```

**Steps:**
1. Click **"Add recipe"**.
2. Fill form with VALID-RCP-001 values.
3. Add ingredients: select "Tuna in water" (p-006), amount 100 g; add "Cherry tomatoes" (p-014), amount 80 g.
4. Submit.

**Expected result:**
- Modal closes
- "Simple tuna salad" appears in recipe list
- Card shows auto-calculated nutrition: kcal ≈ 131 (116 + 14.4), protein ≈ 26.7 g
- Appears in Mine filter

**Status:** ✅

---

### TC-RCP-013: Add recipe with no ingredients (VALID-RCP-002)
**AC:** US-RA-009 — recipe with no ingredients can be saved; nutrition shows all zeros  
**Priority:** Medium

**Test data:** `formInputs.recipeForm.valid[1]` (VALID-RCP-002)
```
name: Empty recipe
category: Snacks
servings: 1
ingredients: (none)
```

**Steps:**
1. Add recipe "Empty recipe" with no ingredients.
2. Submit.

**Expected result:**
- Recipe saved successfully
- Card shows: kcal 0, protein 0 g, fat 0 g, carbs 0 g
- No error or warning about missing ingredients

**Status:** ✅

---

### TC-RCP-014: Import recipe from URL
**AC:** US-RA-010 — website URL import (mock)  
**Priority:** Medium

**Steps:**
1. Click **Import** or **"Add from URL"**.
2. Enter any valid URL (the prototype uses a mock parser).
3. Click **Parse**.

**Expected result:**
- Mock recipe data populated in the form
- User can review and save
- Saved recipe appears in the list and in Mine filter

**Status:** 🚫

---

### TC-RCP-015: Delete user-owned recipe — blocked by current/future planner assignment
**AC:** US-RA-012 — delete blocked when recipe has assignments in current or future week  
**Priority:** High

**Preconditions:** **Turkey meatballs** (r-009) is user-owned and has a **Sunday Dinner** assignment in the current week's planner seed

**Steps:**
1. In Recipes, locate Turkey meatballs.
2. Click **delete** on the card.

**Expected result:**
- Deletion blocked
- Error message shows which day and slot the recipe is assigned to (Sunday, Dinner)
- Turkey meatballs remains in the recipe list

**Status:** ✅

---

### TC-RCP-016: Delete user-owned recipe — only past assignments → succeeds
**AC:** US-RA-012 — delete allowed when all assignments are in past weeks; removed silently  
**Priority:** Medium

> In the prototype (no persistence), simulate by adding a recipe, navigating to a past week, placing it, returning to current week, then deleting.

**Steps:**
1. Add a new recipe "Past week test".
2. Navigate to **previous week** in Planner.
3. Add "Past week test" to any day slot.
4. Return to current week.
5. Navigate to Recipes and delete "Past week test".

**Expected result:**
- Recipe deleted successfully without a confirmation prompt about active assignments
- Recipe removed from list

**Status:** ✅

---

### TC-RCP-017: Edit own recipe — change ingredients updates nutrition
**AC:** US-RA-013 — nutrition updates after ingredient change  
**Priority:** High

**Preconditions:** **Turkey meatballs** (r-009) is user-owned

**Steps:**
1. Click **edit** on Turkey meatballs.
2. Increase Ground turkey from 200 g to 300 g.
3. Save.

**Expected result:**
- Card nutrition updates: protein increases (extra 100 g turkey ≈ +17 g protein, +149 kcal)
- New values visible immediately on the card

**Status:** ✅

---

### TC-RCP-018: System recipes do not show edit/delete controls
**AC:** US-RA-012 — edit/delete only for owned recipes  
**Priority:** Medium

**Steps:**
1. Locate **Berry overnight oats** (r-001, `isUserAdded: false`).
2. Inspect the card for edit/delete controls.

**Expected result:**
- No edit or delete buttons visible on system recipes
- Turkey meatballs (user-owned) does show edit/delete controls

**Status:** ✅

---

## TC-DIT — Dietary analyser

**Requirement:** [`03_dietary_analyser.md`](../requirements/03_dietary_analyser.md)  
**User stories:** [`dietary-analyser.md`](../user-stories/dietary-analyser.md)  
**Test data:** All 12 diets from test-data.json

---

### TC-DIT-001: Diets view shows exactly 12 diets
**AC:** US-DA-001 — exactly the 12 diets defined in requirements  
**Priority:** High

**Steps:**
1. Click **Diets** in the sidebar.
2. Count the diet cards.

**Expected result:**
- Exactly 12 cards: Mediterranean, Plant-based / Flexitarian, MIND, DASH, Paleo, WeightWatchers (WW), Intermittent fasting, Ketogenic (Keto), Volumetrics, Protein-focused, Healthy fats, Hydration guidance
- No "Add diet" button (static list in MVP)

**Status:** ✅

---

### TC-DIT-002: Each diet shows name, description, and macro split where applicable
**AC:** US-DA-002 — description and macro guidance visible  
**Priority:** High

**Steps:**
1. Inspect **Mediterranean** diet card.

**Expected result:**
- Name: "Mediterranean"
- Description visible (matches test-data.json: "Emphasises vegetables, fruits, whole grains…")
- Macro guidance: Protein 15%, Fat 35%, Carbs 50%

**Steps:**
2. Inspect **WeightWatchers (WW)** card.

**Expected result:**
- Name and description visible
- Macro section shows "Points-based — no fixed percentage split" or equivalent note (not applicable)

**Status:** ✅

---

### TC-DIT-003: Mark product compatible with a diet
**AC:** US-DA-003 — compatibility can be set and is visible  
**Priority:** Medium

**Steps:**
1. Open **Quinoa** (p-010) for editing.
2. Add **"MIND"** diet tag.
3. Save.

**Expected result:**
- Quinoa card now shows the MIND diet tag
- Selecting MIND diet filter in Products returns Quinoa

**Status:** ✅

---

### TC-DIT-004: Mark recipe compatible with a diet
**AC:** US-DA-004 — diet compatibility visible on recipe  
**Priority:** Medium

**Steps:**
1. Edit **Greek salad** (r-005).
2. Add **"MIND"** diet tag.
3. Save.

**Expected result:**
- Greek salad card shows MIND tag
- MIND filter in Recipes returns Greek salad

**Status:** ✅

---

## TC-PLN — Meal planner: weekly summary

**Requirement:** [`06_meal_planner.md`](../requirements/06_meal_planner.md) — Tab 1  
**User stories:** [`meal-planner.md`](../user-stories/meal-planner.md)  
**Test data:** `plannerSeeds` from test-data.json (8 assignments)

---

### TC-PLN-001: Default week is current calendar week
**AC:** US-MP-001 — planner defaults to current week  
**Priority:** High

**Steps:**
1. Click **Planner** in the sidebar.

**Expected result:**
- Week label shows Monday–Sunday of the current calendar week (e.g. "Mon 15 Jun – Sun 21 Jun")
- Seeded assignments (Berry overnight oats Mon Breakfast, etc.) visible

**Status:** ✅

---

### TC-PLN-002: Navigate to previous and next weeks
**AC:** US-MP-001 — Prev/Next shift by 7 days  
**Priority:** High

**Steps:**
1. Click **Prev** — note the new week label.
2. Click **Next** — observe.
3. Click **Next** again (now one week ahead of current).
4. Click **"This week"**.

**Expected result:**
- Each Prev/Next shifts the week label by exactly 7 days
- "This week" returns to the current calendar week label

**Status:** ✅

---

### TC-PLN-003: Weekly summary has four meal slots
**AC:** US-MP-003 — four meal slots: Breakfast, Lunch, Dinner, Snacks  
**Priority:** High

**Steps:**
1. Open Planner > Weekly summary tab.

**Expected result:**
- Four labelled meal slot groups visible: Breakfast, Lunch, Dinner, Snacks
- Each group has its own rows section and an "Add item" button

**Status:** ✅

---

### TC-PLN-004: Seeded items appear in correct slots
**AC:** US-MP-003 — assignments from seed data visible  
**Priority:** High

**Preconditions:** Current week loaded; planner seeds applied

**Steps:**
1. Open Weekly summary.

**Expected result** (from test-data.json `plannerSeeds.assignments`):

| Item | Day | Slot | Servings |
|---|---|---|---|
| Berry overnight oats | Mon | Breakfast | 1 |
| Chicken quinoa bowl | Mon | Lunch | 1 |
| Lentil tomato soup | Tue | Dinner | 1 |
| Spinach omelette | Wed | Breakfast | 1 |
| Chickpea curry | Wed | Lunch | 2 |
| Avocado toast | Fri | Breakfast | 1 |
| Greek salad | Fri | Lunch | 1 |
| Turkey meatballs | Sun | Dinner | 2 |

**Status:** ✅

---

### TC-PLN-005: Edit servings in a day cell
**AC:** US-MP-003 — entering a number creates/updates the assignment  
**Priority:** High

**Steps:**
1. In Weekly summary, find **Chickpea curry** in the Lunch slot.
2. The Wednesday cell shows `2`. Change it to `3`.

**Expected result:**
- Wednesday cell shows `3`
- Day cards Wednesday Lunch updates to 3 servings
- Calendar Wednesday cell reflects the change
- Topbar kcal total increases by 310 (1 extra serving of Chickpea curry)

**Status:** ✅

---

### TC-PLN-006: Zero a cell removes the assignment
**AC:** US-MP-003 — clearing or zeroing a cell removes the assignment  
**Priority:** High

**Steps:**
1. In Weekly summary, find **Berry overnight oats** Monday Breakfast cell (currently `1`).
2. Change the value to `0` (or clear it).

**Expected result:**
- Monday Breakfast cell is empty
- Day cards Monday Breakfast no longer shows Berry overnight oats
- Calendar Monday no longer shows Berry overnight oats

**Status:** ✅

---

### TC-PLN-007: Servings / grams toggle
**AC:** US-MP-005 — toggle converts values; grams mode shows equivalent servings  
**Priority:** Medium

**Preconditions:** **Berry overnight oats** (r-001) — `servingG` is defined (or use a product with known gram weight)  

**Steps:**
1. Click the **"g"** toggle on the Berry overnight oats row.

**Expected result:**
- Values in day columns convert to grams (1 serving = serving weight in grams)
- Secondary label shows equivalent servings
- Toggle shows active "g" mode

**Steps:**
2. Click toggle again to return to servings mode.

**Expected result:**
- Values revert to servings display; secondary label shows gram equivalent

**Status:** 🚫

---

### TC-PLN-008: Grams toggle not shown for items without servingG
**AC:** US-MP-005 — grams mode only available when gram weight per serving is defined  
**Priority:** Low

**Preconditions:** Add an item that has no `servingG` defined (e.g. a custom recipe with no weight data)

**Steps:**
1. Inspect the row for such an item.

**Expected result:**
- "g" toggle not shown or is disabled for that row

**Status:** 🚫

---

### TC-PLN-009: Add a row to a meal slot
**AC:** US-MP-004 — "Add item" appends a blank row  
**Priority:** High

**Steps:**
1. Click **"Add breakfast item"** in the Breakfast slot.
2. Type `salmon` in the search field that appears.
3. Select **Atlantic salmon** (p-005).
4. Enter `1` in the Tuesday cell.

**Expected result:**
- Atlantic salmon row added to Breakfast slot
- Tuesday Breakfast day card shows Atlantic salmon with 1 serving
- kcal total increases by 208

**Status:** ✅

---

### TC-PLN-010: Remove a row from the summary
**AC:** US-MP-004 — removing a row removes all assignments for that item+slot only  
**Priority:** High

**Preconditions:** Chickpea curry in Lunch slot (from seeds: Wed 2 servings)

**Steps:**
1. Click **×** on the Chickpea curry row in the Lunch slot.

**Expected result:**
- Row removed from Lunch slot
- Wednesday Lunch day card no longer shows Chickpea curry
- If Chickpea curry exists in other slots (e.g. Dinner), those are unaffected

**Status:** ✅

---

### TC-PLN-011: "This week" item auto-added to Lunch slot
**AC:** US-MP-006 — marking "This week" in Products populates Lunch slot  
**Priority:** High

**Preconditions:** **Broccoli** (p-013) has `thisWeek: false`

**Steps:**
1. Navigate to Products.
2. Mark Broccoli "This week".
3. Return to Planner > Weekly summary.

**Expected result:**
- Broccoli appears in the **Lunch** meal slot of the summary
- Not duplicated if already present

**Status:** ✅

---

### TC-PLN-012: Day card shows kcal as percentage of calorie target
**AC:** US-MP-019 — each day card shows planned kcal as % of calorie corridor  
**Priority:** Medium

**Preconditions:** User u-001 has calorie target 2000 kcal; seed data loaded (Mon has r-001 385 kcal + r-004 450 kcal = 835 kcal); navigate to Day cards tab

**Steps:**
1. Open Planner > Day cards.
2. Inspect the **Monday** card.

**Expected result:**
- Monday card shows: "835 kcal" and a percentage indicator such as "42%" (835 / 2000)
- Percentage is shown as a bar, label, or numeric indicator
- If no calorie target is set (user u-003), percentage strip is absent

**Status:** 🚫

---

### TC-PLN-013: Planner item search sorts recently used items first
**AC:** US-MP-020 — search suggestions in planner show recently planned items at top  
**Priority:** Medium

**Preconditions:** Seed assignments include Berry overnight oats (r-001) on Monday Breakfast

**Steps:**
1. Open Planner > Weekly summary.
2. In any meal-slot row, click the item search input.
3. Observe default suggestions (no text typed or type a single generic letter).

**Expected result:**
- Berry overnight oats (r-001) and other seeded items appear at or near the top
- Items with no recent usage appear below the recently-used group
- Typing additional characters narrows results but preserves the recently-used ordering within the visible set

**Status:** 🚫

---

## TC-DAY — Meal planner: day cards

**Requirement:** [`06_meal_planner.md`](../requirements/06_meal_planner.md) — Tab 2  
**User stories:** US-MP-007 – US-MP-010

---

### TC-DAY-001: Day cards tab shows 7 cards
**AC:** US-MP-007 — one card per day, horizontally scrollable  
**Priority:** High

**Steps:**
1. Click the **Day cards** tab in Planner.

**Expected result:**
- 7 cards visible (Mon–Sun of selected week)
- Cards are horizontally scrollable if they overflow the viewport
- Each card shows day name and date

**Status:** ✅

---

### TC-DAY-002: Each card has four meal slots
**AC:** US-MP-007 — Breakfast, Lunch, Dinner, Snacks per card  
**Priority:** High

**Steps:**
1. Open Day cards tab.
2. Inspect Monday card.

**Expected result:**
- 4 sections: Breakfast, Lunch, Dinner, Snacks
- Monday Breakfast: Berry overnight oats (1 serving)
- Monday Lunch: Chicken quinoa bowl (1 serving)

**Status:** ✅

---

### TC-DAY-003: Day macro strip shows correct totals
**AC:** US-MP-007 — aggregated nutrition strip per day  
**Priority:** High

**Preconditions:** Monday has Berry overnight oats (Breakfast) + Chicken quinoa bowl (Lunch)

**Steps:**
1. View Monday day card.

**Expected result:**
- Nutrition strip shows summed values:
  - kcal: 385 + 450 = **835**
  - protein: 15 + 38 = **53 g**
  - fat: 8 + 12 = **20 g**
  - carbs: 65 + 42 = **107 g**

**Status:** ✅

---

### TC-DAY-004: Add item to a slot via day card
**AC:** US-MP-008 — inline search add; also appears in Weekly summary  
**Priority:** High

**Steps:**
1. On **Thursday** card (no assignments in seed data), click **"+ Add"** in Dinner slot.
2. Type `soup` — select **Broccoli cheddar soup** (r-007).
3. Confirm.

**Expected result:**
- Broccoli cheddar soup appears in Thursday Dinner slot
- Weekly summary shows Broccoli cheddar soup in the Dinner row with `1` in the Thursday cell
- Thursday macro strip updates: +220 kcal

**Status:** ✅

---

### TC-DAY-005: Remove item from a slot
**AC:** US-MP-008 — remove button deletes the assignment  
**Priority:** High

**Steps:**
1. Click **×** on **Lentil tomato soup** in Tuesday Dinner.

**Expected result:**
- Lentil tomato soup removed from Tuesday Dinner
- Weekly summary Tuesday Dinner cell clears
- If Lentil tomato soup has no other assignments, row may auto-remove from summary (or remain with empty cells)

**Status:** ✅

---

### TC-DAY-006: Increase servings with + button
**AC:** US-MP-009 — + increases servings by 0.5 per tap  
**Priority:** Medium

**Preconditions:** **Turkey meatballs** in Sunday Dinner at 2 servings

**Steps:**
1. Click **+** on Turkey meatballs in Sunday Dinner.

**Expected result:**
- Servings change from 2 to 2.5
- Sunday macro strip kcal increases by 145 (0.5 × 290)
- Weekly summary Sunday Dinner cell shows 2.5

**Status:** ✅

---

### TC-DAY-007: Decrease servings with − button — minimum is 0.5
**AC:** US-MP-009 — − decreases by 0.5; minimum 0.5; item not auto-removed  
**Priority:** Medium

**Preconditions:** Turkey meatballs in Sunday Dinner at 2 servings

**Steps:**
1. Click **−** three times (2.0 → 1.5 → 1.0 → 0.5).
2. Click **−** a fourth time when at 0.5.

**Expected result:**
- After 3 clicks: servings show 0.5
- 4th click: servings remain at 0.5 (does not go below 0.5; item not removed)
- To remove the item, the × button must be used

**Status:** ✅

---

### TC-DAY-008: Drag item to a different meal slot on the same card
**AC:** US-MP-010 — drag within a card reassigns meal slot  
**Priority:** Low

**Steps:**
1. Drag **Berry overnight oats** from Monday Breakfast to Monday Lunch.

**Expected result:**
- Berry overnight oats appears in Monday Lunch
- Monday Breakfast slot is cleared of Berry overnight oats
- Weekly summary row for Berry overnight oats updates: Monday column moves from Breakfast slot to Lunch slot

**Status:** 🚫

---

### TC-DAY-009: Drag item to a different day card
**AC:** US-MP-010 — drag across cards changes day  
**Priority:** Low

**Steps:**
1. Drag **Greek salad** from Friday Lunch to Saturday Lunch.

**Expected result:**
- Greek salad in Saturday Lunch
- Friday Lunch cleared
- Weekly summary: Friday cell clears; Saturday cell shows the assignment

**Status:** 🚫

---

## TC-CAL — Meal planner: calendar

**Requirement:** [`06_meal_planner.md`](../requirements/06_meal_planner.md) — Tab 2 — Calendar  
**User stories:** US-MP-011 – US-MP-014

---

### TC-CAL-001: Calendar tab is accessible
**AC:** US-MP-011 — calendar tab renders  
**Priority:** High

**Steps:**
1. Click **Calendar** tab in Planner.

**Expected result:**
- Calendar renders with Week / Month sub-view toggle visible
- Week sub-view is default; 7-column grid shown

**Status:** ✅

---

### TC-CAL-002: Today's date is highlighted
**AC:** US-MP-011 — today highlighted with teal circle  
**Priority:** Medium

**Steps:**
1. Open Calendar > Week sub-view.

**Expected result:**
- Today's date cell has a teal-circled day number
- Other dates do not have this highlight

**Status:** ✅

---

### TC-CAL-003: Seeded items appear in correct day cells
**AC:** US-MP-011 — calendar reflects same assignments as other tabs  
**Priority:** High

**Steps:**
1. Open Calendar > Week sub-view (current week).

**Expected result:**
- Monday cell: Berry overnight oats (Breakfast), Chicken quinoa bowl (Lunch)
- Tuesday cell: Lentil tomato soup (Dinner)
- Wednesday cell: Spinach omelette (Breakfast), Chickpea curry (Lunch, 2 servings)
- Thursday: empty
- Friday: Avocado toast (Breakfast), Greek salad (Lunch)
- Saturday: empty
- Sunday: Turkey meatballs (Dinner, 2 servings)

**Status:** ✅

---

### TC-CAL-004: Each calendar item shows slot label and servings
**AC:** US-MP-011 — items show thumbnail, name, slot label, serving count  
**Priority:** Medium

**Steps:**
1. Inspect the Monday cell.

**Expected result:**
- Berry overnight oats shows: name, "Breakfast" label, "1×" serving count
- Chicken quinoa bowl shows: name, "Lunch" label, "1×" serving count

**Status:** ✅

---

### TC-CAL-005: Add item via calendar cell
**AC:** US-MP-013 — add creates assignment and registers in weekly summary  
**Priority:** High

**Steps:**
1. Click **"+ Add"** in the Thursday cell.
2. Type `pudding` — select **Chia pudding** (r-012).
3. Select slot **Snacks**.
4. Confirm.

**Expected result:**
- Chia pudding appears in Thursday calendar cell with "Snacks" label
- Weekly summary > Snacks slot shows Chia pudding with `1` in Thursday column
- Thursday macro strip updates: +210 kcal

**Status:** ✅

---

### TC-CAL-006: Add with no item selected — nothing added
**AC:** US-MP-013 — empty search should not create an assignment  
**Priority:** Medium

**Steps:**
1. Click **"+ Add"** in the Saturday cell.
2. Leave search field empty.
3. Click Add / confirm.

**Expected result:**
- Nothing added to Saturday
- No empty row in weekly summary

**Status:** ✅

---

### TC-CAL-007: Remove item via × in calendar
**AC:** US-MP-013 — hovering reveals × button; click removes assignment  
**Priority:** High

**Steps:**
1. Hover over **Lentil tomato soup** in the Tuesday cell.
2. Click the × button.

**Expected result:**
- Lentil tomato soup removed from Tuesday calendar cell
- Weekly summary Tuesday Dinner cell clears

**Status:** ✅

---

### TC-CAL-008: Drag between day cells preserves meal slot
**AC:** US-MP-014 — drag keeps original meal slot; updates only the day  
**Priority:** Low

**Steps:**
1. Drag **Avocado toast** (Friday Breakfast) to the Saturday cell.

**Expected result:**
- Avocado toast appears in Saturday with "Breakfast" slot label
- Friday cell no longer shows Avocado toast
- Weekly summary: Friday Breakfast cell clears; Saturday Breakfast cell shows the assignment

**Status:** 🚫

---

### TC-CAL-009: Calendar changes reflect in day cards
**AC:** US-MP-011 — all three tabs share the same data  
**Priority:** High

**Steps:**
1. Add Chia pudding to Thursday via Calendar (TC-CAL-005).
2. Switch to **Day cards** tab.

**Expected result:**
- Thursday Snacks slot shows Chia pudding

**Status:** ✅

---

### TC-CAL-010: Switch to month sub-view
**AC:** US-MP-012 — month view shows 42-cell grid  
**Priority:** Medium

**Steps:**
1. Click **Month** toggle in Calendar tab.

**Expected result:**
- 42-cell grid displayed (6 rows × 7 columns, Mon–Sun)
- Day-of-week header visible
- Days outside current month are visually de-emphasised
- Month label shows current month name

**Status:** ✅

---

### TC-CAL-011: Today highlighted in month view
**AC:** US-MP-012 — today cell has teal circle in month view  
**Priority:** Medium

**Steps:**
1. Open Calendar > Month sub-view.

**Expected result:**
- Today's date cell has teal-circled day number

**Status:** ✅

---

### TC-CAL-012: Prev / Next month navigation
**AC:** US-MP-012 — Prev/Next month buttons within calendar header  
**Priority:** Medium

**Steps:**
1. In month sub-view, click **‹ (Prev month)**.
2. Click **› (Next month)**.

**Expected result:**
- Grid shifts to previous / next month
- Month label updates accordingly
- Week navigation (above tabs) remains unchanged

**Status:** ✅

---

### TC-CAL-013: Switching back to week sub-view preserves state
**AC:** US-MP-012 — state preserved when toggling sub-views  
**Priority:** Medium

**Steps:**
1. Make a change in month view (e.g. add an item to next week).
2. Toggle back to Week sub-view.

**Expected result:**
- All previous items and assignments intact
- Week view shows same data as before switching to month view

**Status:** ✅

---

### TC-CAL-014: Calendar tab has Day / 4 Days / Week / Month sub-view buttons
**AC:** US-MP-017 — four-way sub-view toggle  
**Priority:** High

**Steps:**
1. Click **Calendar** tab in Planner.

**Expected result:**
- A button group with four options is visible: **Day**, **4 Days**, **Week**, **Month**
- "Week" is the default active sub-view (or whichever was previously selected)

**Status:** ✅

---

### TC-CAL-015: Day sub-view shows a single day's assignments
**AC:** US-MP-017 — Day sub-view displays one day column  
**Priority:** High

**Steps:**
1. Open Calendar tab, click **Day** button.

**Expected result:**
- One column is shown for the currently active day
- Items are grouped by meal slot (Breakfast, Lunch, Dinner, Snacks)
- Monday items visible (Berry overnight oats — Breakfast, Chicken quinoa bowl — Lunch)
- Add, remove, and serving-count controls are present

**Status:** ✅

---

### TC-CAL-016: 4 Days sub-view shows 4 consecutive days
**AC:** US-MP-017 — 4 Days sub-view shows 4 columns  
**Priority:** High

**Steps:**
1. Open Calendar tab, click **4 Days** button.

**Expected result:**
- Four columns visible (Mon, Tue, Wed, Thu if Monday is the selected start day)
- Each column shows the correct seeded assignments
- Drag between the four visible columns works (see TC-DAY-009 pattern)

**Status:** ✅

---

### TC-CAL-017: Calendar plan summary panel is shown above the grid
**AC:** US-MP-018 — plan summary lists all items in visible range  
**Priority:** High

**Steps:**
1. Open Calendar tab (Week sub-view; current week).

**Expected result:**
- A plan summary section appears above the 7-column grid
- Lists all 8 seeded items with their total servings and kcal contribution
- Example: "Berry overnight oats — 1 serving — 385 kcal"

**Status:** ✅

---

### TC-CAL-018: Drag item from summary panel to a day cell
**AC:** US-MP-018 — drag from summary creates assignment; item remains in summary  
**Priority:** Medium

**Steps:**
1. In Calendar Week sub-view, locate **Greek salad** in the plan summary (currently Friday Lunch).
2. Drag **Greek salad** from the summary panel to the **Thursday** cell.
3. Select meal slot **Dinner**.

**Expected result:**
- A new assignment is created: Thursday Dinner — Greek salad
- Greek salad **still appears** in the plan summary (it was already planned; this adds a new day)
- Thursday cell in the grid now shows Greek salad
- Weekly summary: Thursday Dinner column shows Greek salad

**Status:** ✅

---

### TC-CAL-019: Drag item from one day cell to another in calendar
**AC:** US-MP-018 — drag between day cells moves assignment (disappears from source)  
**Priority:** Medium

**Steps:**
1. In Calendar Week sub-view, drag **Avocado toast** from the Friday cell to the Saturday cell.

**Expected result:**
- Avocado toast **disappears** from Friday
- Avocado toast appears in Saturday with the same meal slot (Breakfast)
- Weekly summary: Friday Breakfast clears; Saturday Breakfast shows Avocado toast

**Status:** ✅

---

### TC-CAL-020: Log this day from Planner
**AC:** US-MP-016 — "Log this day" creates tracking entries for the selected day  
**Priority:** High

**Steps:**
1. In Planner (any view), select **Monday**.
2. Trigger **"Log this day"** action.
3. Navigate to Profile > Meal tracking.

**Expected result:**
- Today's tracking log contains entries for Berry overnight oats (1 serving, 385 kcal) and Chicken quinoa bowl (1 serving, 450 kcal)
- Entries are editable
- No new planner assignments were created

**Status:** 🚫

---

### TC-CAL-021: Log this week from Planner
**AC:** US-MP-016 — "Log this week" creates tracking entries for all assignments across Mon–Sun of the selected week  
**Priority:** High

**Preconditions:** Seed data loaded; current week selected; 8 seeded assignments across Mon / Tue / Wed / Fri / Sun

**Steps:**
1. In Planner (any view), trigger **"Log this week"** action.
2. Navigate to Profile > Meal tracking.
3. Check entries for each day that has a seed assignment.

**Expected result:**
- Meal tracking shows entries for all 8 seeded assignments, grouped by day
- Each entry shows item name, serving count, and meal slot pre-filled
- All entries are editable
- No planner assignments were added, changed, or removed

**Status:** 🚫

---

### TC-CAL-022: Log this day — duplicate-prevention (adds to existing entry)
**AC:** US-MP-016 AC#5 — if a tracking entry already exists for the same day and item, the action adds to it rather than duplicating  
**Priority:** Medium

**Preconditions:** "Log this day" has already been triggered for Monday; tracking log contains Berry overnight oats 1 serving for Monday

**Steps:**
1. In Planner, select **Monday** and trigger **"Log this day"** a second time.
2. Navigate to Profile > Meal tracking and inspect Monday's entries.

**Expected result:**
- Berry overnight oats entry shows **2 servings** (original 1 + new 1), not two separate 1-serving entries
- Chicken quinoa bowl entry similarly shows 2 servings
- No orphaned duplicate entries for Monday

**Status:** 🚫

---

## TC-SHP — Shopping list

**Requirement:** [`07_shopping_list.md`](../requirements/07_shopping_list.md)  
**User stories:** [`shopping-list.md`](../user-stories/shopping-list.md)  
**Test data:** `plannerSeeds._derivedShoppingList` from test-data.json

---

### TC-SHP-001: Shopping list is a top-level navigation item
**AC:** US-SL-001 — separate nav item  
**Priority:** High

**Steps:**
1. Open app.
2. Observe sidebar.

**Expected result:**
- "Shopping list" appears as a dedicated sidebar entry, separate from Planner
- Clicking it shows the shopping list view; Planner state unaffected

**Status:** ✅

---

### TC-SHP-002: Default date range is current calendar week
**AC:** US-SL-002 — default range Mon–Sun of current week  
**Priority:** High

**Steps:**
1. Navigate to **Shopping list**.

**Expected result:**
- "From" date = Monday of current week
- "To" date = Sunday of current week
- Plan summary populated from current week's seed assignments

**Status:** ✅

---

### TC-SHP-003: Plan summary shows seeded items with correct totals
**AC:** US-SL-003 — item name, total servings, kcal contribution  
**Priority:** High

**Preconditions:** Default date range (current week); seed assignments from test-data.json

**Steps:**
1. Open Shopping list with default range.
2. Inspect the plan summary section.

**Expected result** (from test-data.json seeds):

| Item | Total servings | kcal contribution |
|---|---|---|
| Berry overnight oats | 1 | 385 |
| Chicken quinoa bowl | 1 | 450 |
| Lentil tomato soup | 1 | 280 |
| Spinach omelette | 1 | 225 |
| Chickpea curry | 2 | 620 |
| Avocado toast | 1 | 310 |
| Greek salad | 1 | 265 |
| Turkey meatballs | 2 | 580 |

**Status:** ✅

---

### TC-SHP-004: Grocery list is grouped by category
**AC:** US-SL-004 — lines grouped under Produce, Dairy, Meat, Fish, Grains, Legumes, Nuts & Seeds, Beverages, Condiments, Other  
**Priority:** High

**Steps:**
1. Generate grocery list from current week seeds.

**Expected result:**
- Lines appear under category headers
- **Dairy** group contains: Greek yogurt, Whole eggs, Whole milk
- **Produce** group contains: Baby spinach, Banana, Cherry tomatoes, Avocado
- **Meat** group contains: Chicken breast, Ground turkey
- **Grains** group contains: Quinoa, Rolled oats, Whole wheat bread
- **Legumes** group contains: Chickpeas, Red lentils
- **Condiments** group contains: Olive oil
- **Nuts & Seeds** group contains: Chia seeds

**Status:** ✅

---

### TC-SHP-005: Same ingredient aggregated across multiple recipes
**AC:** US-SL-004 — quantities for same ingredient summed on one line  
**Priority:** High

**Preconditions:** Current week seeds; Cherry tomatoes appear as ingredient in:
- Chicken quinoa bowl: 50 g
- Lentil tomato soup: 150 g
- Chickpea curry (×2 servings): 150 g × 2 = 300 g
- Greek salad: 100 g
- Turkey meatballs (×2 servings): 100 g × 2 = 200 g

**Steps:**
1. Generate grocery list.
2. Find Cherry tomatoes in the Produce category.

**Expected result:**
- One line: **Cherry tomatoes — 800 g** (50 + 150 + 300 + 100 + 200)
- Not listed separately per recipe

**Status:** ✅

---

### TC-SHP-006: Each grocery line shows name, quantity, and unit
**AC:** US-SL-004 — line format: name, total quantity, unit  
**Priority:** High

**Steps:**
1. Inspect any line in the grocery list.

**Expected result:**
- Format: `[Name] — [quantity] [unit]`
- Example: `Rolled oats — 70 g`, `Chia seeds — 53 g`, `Banana — 1 pc`

**Status:** ✅

---

### TC-SHP-007: Changing date range filters the list
**AC:** US-SL-002 — date change updates plan summary and grocery list  
**Priority:** High

**Steps:**
1. Change the **"To"** date to Wednesday of the current week.

**Expected result:**
- Plan summary now only shows: Berry overnight oats (Mon Breakfast), Chicken quinoa bowl (Mon Lunch), Lentil tomato soup (Tue Dinner), Spinach omelette (Wed Breakfast), Chickpea curry (Wed Lunch)
- Thursday–Sunday assignments excluded
- Grocery list recalculates to reflect only Mon–Wed items

**Status:** ✅

---

### TC-SHP-008: Invalid date range (end before start) is rejected
**AC:** US-SL-005 — validation error; list not generated  
**Priority:** Medium

**Steps:**
1. Set "From" = current Wednesday, "To" = current Monday.

**Expected result:**
- Validation error shown ("End date must be after start date" or similar)
- List not generated or cleared

**Status:** ✅

---

### TC-SHP-009: List stale after plan change
**AC:** US-SL-005 — stale indicator shown after plan change  
**Priority:** Medium

**Steps:**
1. Generate list from current week seeds.
2. Navigate to Planner and add **Chia pudding** to Thursday Snacks.
3. Return to Shopping list.

**Expected result:**
- Stale indicator shown ("List stale" or similar badge)
- Old list still visible until refreshed

**Status:** ✅

---

### TC-SHP-010: Refresh regenerates the list
**AC:** US-SL-005 — refresh clears stale indicator and regenerates from current plan  
**Priority:** Medium

**Preconditions:** Stale state (TC-SHP-009)

**Steps:**
1. Click **"Refresh list"**.

**Expected result:**
- List regenerates; Chia pudding ingredients included (chia seeds 28 g, whole milk 200 ml, banana 0.5 pc)
- Stale indicator clears

**Status:** ✅

---

### TC-SHP-011: Empty range produces empty list
**AC:** US-SL-002 / US-SL-003 — empty state  
**Priority:** Low

**Steps:**
1. Set date range to a future month with no assignments.
2. Generate list.

**Expected result:**
- Plan summary shows no items
- Grocery list is empty or shows "No items planned for this period"

**Status:** ✅

---

### TC-SHP-012: Grocery list auto-generates on navigation
**AC:** US-SL-006 — list is generated automatically on navigating to Shopping list  
**Priority:** High

**Steps:**
1. Ensure seed plan data is loaded.
2. Click **Shopping list** in the sidebar.

**Expected result:**
- Plan summary and grocery list are populated immediately on arrival — no "Generate" button press required
- Default date range is current calendar week
- Plan summary and grocery list match the seeded assignments (same content as TC-SHP-003 and TC-SHP-004)

**Status:** ✅

---

### TC-SHP-013: Changing date range auto-regenerates list
**AC:** US-SL-006 — date range change triggers immediate regeneration  
**Priority:** High

**Preconditions:** Shopping list is open and auto-generated for current week

**Steps:**
1. Change the **"To"** date to Wednesday of the current week.

**Expected result:**
- Plan summary and grocery list update immediately without a separate button press
- Only Mon–Wed assignments shown (same filtering as TC-SHP-007)

**Status:** ✅

---

## TC-PRF — Personal cabinet / profile

**Requirement:** [`05_personal_cabinet.md`](../requirements/05_personal_cabinet.md)  
**User stories:** [`personal-cabinet.md`](../user-stories/personal-cabinet.md)  
**Test data:** Users u-001 (Mediterranean, 2000 kcal), u-002 (Keto, 1800 kcal), u-003 (empty profile)

---

### TC-PRF-001: Profile view sections are present
**AC:** US-PC-001 – US-PC-006 — all profile sections visible  
**Priority:** High

**Steps:**
1. Click **Profile** in the sidebar.

**Expected result:**
All sections present:
- Personal: email/password, language, unit system, gender, age, weight
- Diet preferences: diet selector, calorie target, macro % inputs, calorie corridor
- Meal tracking log

**Status:** ✅

---

### TC-PRF-002: Calorie corridor calculates correctly
**AC:** US-PC-005 — corridor = target ± 150  
**Priority:** High

**Test data:** `formInputs.profileForm.calorieTarget`

**Steps:**
1. Set calorie target to **2000**.
2. Observe corridor display.

**Expected result:**
- Corridor shows **"1850 – 2150 kcal"**

**Steps:**
3. Change target to **1500**.

**Expected result:**
- Corridor shows **"1350 – 1650 kcal"**

**Status:** ✅

---

### TC-PRF-003: Macro validation — sums to 100% is accepted (VALID-MAC-001)
**AC:** US-PC-005 — no warning when sum = 100%  
**Priority:** High

**Test data:** `formInputs.profileForm.validMacros[0]` — protein 30, fat 35, carbs 35 (sum = 100)

**Steps:**
1. Set protein = 30%, fat = 35%, carbs = 35%.
2. Observe UI.

**Expected result:**
- No warning shown
- Values accepted

**Status:** ✅

---

### TC-PRF-004: Macro validation — over 100% shows warning (INVALID-MAC-001)
**AC:** US-PC-005 — warning when sum ≠ 100%  
**Priority:** High

**Test data:** `formInputs.profileForm.invalidMacros[0]` — protein 50, fat 50, carbs 50 (sum = 150)

**Steps:**
1. Set protein = 50%, fat = 50%, carbs = 50%.
2. Observe UI.

**Expected result:**
- Warning message shown: "Macro percentages must sum to 100%" (or equivalent)
- Warning visible without requiring form submission

**Status:** ✅

---

### TC-PRF-005: Macro validation — under 100% shows warning (INVALID-MAC-002)
**AC:** US-PC-005 — warning when sum < 100%  
**Priority:** Medium

**Test data:** `formInputs.profileForm.invalidMacros[1]` — protein 10, fat 10, carbs 10 (sum = 30)

**Steps:**
1. Set protein = 10%, fat = 10%, carbs = 10%.

**Expected result:**
- Same warning as TC-PRF-004

**Status:** ✅

---

### TC-PRF-006: Active diet shown in Planner header
**AC:** US-PC-005 / US-MP-015 — active diet label in planner header  
**Priority:** High

**Steps:**
1. In Profile, set active diet to **Ketogenic**.
2. Navigate to Planner.

**Expected result:**
- Planner header shows "Ketogenic" (or "Keto") diet label
- Label is informational only — no foods are filtered or blocked

**Status:** ✅

---

### TC-PRF-007: No active diet — label hidden in Planner
**AC:** US-MP-015 — label not shown when no diet selected  
**Priority:** Medium

**Steps:**
1. In Profile, clear / deselect the active diet.
2. Navigate to Planner.

**Expected result:**
- No diet label shown in Planner header

**Status:** ✅

---

### TC-PRF-008: Language preference selector is present
**AC:** US-PC-002 — language setting available  
**Priority:** Low

**Steps:**
1. Open Profile > Personal section.

**Expected result:**
- Language dropdown present (options: English, Ukrainian at minimum)

**Status:** ✅

---

### TC-PRF-009: Unit system toggle is present
**AC:** US-PC-003 — metric / US customary toggle  
**Priority:** Medium

**Steps:**
1. Open Profile > Personal section.

**Expected result:**
- Metric / US customary (imperial) toggle present

**Status:** ✅

---

### TC-PRF-010: Demographic fields are present
**AC:** US-PC-004 — gender, age, weight, body composition  
**Priority:** Medium

**Steps:**
1. Open Profile > Personal section.

**Expected result:**
- Fields present: Gender (selector), Age (numeric input), Weight (numeric input)

**Status:** ✅

---

### TC-PRF-011: Keto macro split — correct corridor (VALID-MAC-002)
**AC:** US-PC-005 — keto split (25/70/5) accepted with no warning  
**Priority:** Medium

**Test data:** `formInputs.profileForm.validMacros[1]` — protein 25, fat 70, carbs 5

**Steps:**
1. Set protein = 25%, fat = 70%, carbs = 5%.
2. Set calorie target to 1800.

**Expected result:**
- No macro warning (sums to 100%)
- Corridor: **"1650 – 1950 kcal"**

**Status:** ✅

---

### TC-PRF-012: Change email address
**AC:** US-PC-001 — email change requires password confirmation and new address must be unique  
**Priority:** High

**Test data:** User u-001 (ol.melnikowa@gmail.com); existing user u-002 has a different email

**Steps (happy path):**
1. Open Profile.
2. Locate the **Change email** control.
3. Enter a new unique email address and the current password.
4. Submit.

**Expected result:**
- Email is updated; new address is shown in the profile
- No error shown

**Steps (duplicate email):**
5. Repeat with an email address already in use by another account.

**Expected result:**
- Change is rejected with an error message
- Error does not reveal whether the address belongs to an existing account (per US-AUTH-001 enumeration rule)

**Steps (wrong password):**
6. Repeat with the correct new email but an incorrect current password.

**Expected result:**
- Change is rejected with a "wrong password" error

**Status:** 🚫

---

### TC-PRF-013: Change password
**AC:** US-PC-001 — password change requires current password; after change, current session is invalidated  
**Priority:** High

**Test data:** User u-001; current password known

**Steps (happy path):**
1. Open Profile.
2. Locate the **Change password** control.
3. Enter the current password and a new password of 8+ characters.
4. Submit.

**Expected result:**
- Password is changed
- Current session is invalidated immediately
- User is redirected to the sign-in screen
- Old password no longer grants access

**Steps (short new password):**
5. Attempt with a new password of 7 characters.

**Expected result:**
- Change is rejected with a clear minimum-length validation message
- Session is not invalidated

**Steps (wrong current password):**
6. Attempt with an incorrect current password and a valid new password.

**Expected result:**
- Change is rejected with a "wrong password" error
- Session is not invalidated

**Status:** 🚫

---

## TC-MLT — Meal tracking

**Requirement:** [`05_personal_cabinet.md`](../requirements/05_personal_cabinet.md) — Meal tracking section  
**User stories:** US-PC-006

---

### TC-MLT-001: Meal tracking section present in Profile
**AC:** US-PC-006 — log section visible  
**Priority:** High

**Steps:**
1. Open Profile.

**Expected result:**
- Meal tracking / food log section present
- "Add entry" button visible
- Daily history area visible

**Status:** ✅

---

### TC-MLT-002: Add a product log entry
**AC:** US-PC-006 — add log entry for a product  
**Priority:** High

**Steps:**
1. Click **"Add entry"** in Meal tracking.
2. Search for **Greek yogurt** (p-001).
3. Enter quantity: 200 g.
4. Confirm.

**Expected result:**
- Entry appears in today's log: "Greek yogurt — 200 g — 117 kcal" (88 kcal per 150 g × 200/150)
- Daily total updates: kcal increases by 117

**Status:** ✅

---

### TC-MLT-003: Add a recipe log entry
**AC:** US-PC-006 — add log entry for a recipe  
**Priority:** High

**Steps:**
1. Click **"Add entry"**.
2. Search for **Berry overnight oats** (r-001).
3. Enter quantity: 1 serving.
4. Confirm.

**Expected result:**
- Entry appears: "Berry overnight oats — 1 serving — 385 kcal"
- Daily kcal total increases by 385

**Status:** ✅

---

### TC-MLT-004: Daily nutrition summary totals across entries
**AC:** US-PC-006 — daily view aggregates nutrition  
**Priority:** High

**Preconditions:** Add Greek yogurt 200 g (TC-MLT-002) and Berry overnight oats 1 serving (TC-MLT-003)

**Steps:**
1. View daily summary in Meal tracking.

**Expected result:**
- Total kcal: 117 + 385 = **502 kcal**
- Total protein: approx. 20 + 15 = **35 g**
- Total fat: approx. 0.8 + 8 = **8.8 g**
- Total carbs: approx. 7.2 + 65 = **72.2 g**

**Status:** ✅

---

### TC-MLT-005: Meal tracking does not create a planner assignment
**AC:** US-PC-006 — tracking and planning are independent  
**Priority:** High

**Steps:**
1. Log **Chicken quinoa bowl** (r-004) in Meal tracking.
2. Navigate to Planner > Weekly summary.

**Expected result:**
- No new assignment for Chicken quinoa bowl created by the log entry
- Only the pre-existing seed assignment (Monday Lunch) appears

**Status:** ✅

---

### TC-MLT-006: Planner assignment does not create a log entry
**AC:** US-PC-006 — planning an item does not log it as eaten  
**Priority:** High

**Steps:**
1. In Planner, add **Almond energy snack** (r-011) to Friday Snacks.
2. Navigate to Meal tracking.

**Expected result:**
- No entry for Almond energy snack in today's Meal tracking log

**Status:** ✅

---

### TC-MLT-007: Edit a log entry
**AC:** US-PC-006 — entries are editable  
**Priority:** Medium

**Preconditions:** Greek yogurt 200 g entry added (TC-MLT-002)

**Steps:**
1. Click edit on the Greek yogurt entry.
2. Change quantity from 200 g to 300 g.
3. Save.

**Expected result:**
- Entry updates: 300 g, kcal recalculated (≈ 176 kcal)
- Daily total recalculates

**Status:** ✅

---

### TC-MLT-008: Delete a log entry
**AC:** US-PC-006 — entries can be removed  
**Priority:** Medium

**Preconditions:** Berry overnight oats entry added (TC-MLT-003)

**Steps:**
1. Click delete on the Berry overnight oats log entry.

**Expected result:**
- Entry removed from today's log
- Daily total decreases by 385 kcal

**Status:** ✅

---

### TC-MLT-009: Meal tracking calendar view is accessible
**AC:** US-PC-007 — calendar view shows logged days  
**Priority:** High

**Steps:**
1. Log **Greek yogurt 200 g** (TC-MLT-002) and **Berry overnight oats 1 serving** (TC-MLT-003).
2. In Profile > Meal tracking, switch to the calendar view.

**Expected result:**
- Calendar view renders with day cells for the current week
- Today's cell shows Greek yogurt and Berry overnight oats (or total kcal 502)
- A visual indicator shows whether today's logged kcal is within the calorie corridor

**Status:** 🚫

---

### TC-MLT-010: Calendar tracking view navigates between weeks
**AC:** US-PC-007 — week/month navigation in tracking calendar  
**Priority:** Medium

**Steps:**
1. In the tracking calendar view, click **Prev week**.
2. Click **Next week**.

**Expected result:**
- Calendar shifts to the previous / next week
- Empty cells shown for days with no logged entries

**Status:** 🚫

---

### TC-MLT-011: Daily goal corridor summary — within target
**AC:** US-PC-008 — "Within goal" shown when kcal is in corridor  
**Priority:** High

**Test data:** User u-001: calorie target 2000 kcal → corridor 1850–2150 kcal

**Preconditions:** Log entries totalling **1950 kcal** for today

**Steps:**
1. Log entries summing to 1950 kcal.
2. View the goal corridor summary panel.

**Expected result:**
- Panel shows today's logged kcal: 1950
- Status label: "Within goal" (or equivalent positive indicator)
- Corridor shown: 1850–2150 kcal

**Status:** 🚫

---

### TC-MLT-012: Daily goal corridor summary — below target
**AC:** US-PC-008 — "Below target" shown when kcal is under corridor  
**Priority:** Medium

**Preconditions:** Log entries totalling **1200 kcal** for today; user corridor 1850–2150

**Steps:**
1. Log entries summing to 1200 kcal.
2. View corridor summary panel.

**Expected result:**
- Status label: "Below target" (or equivalent warning indicator)

**Status:** 🚫

---

### TC-MLT-013: Weekly corridor summary — days on target count
**AC:** US-PC-008 — weekly summary shows days on target out of 7  
**Priority:** Medium

**Preconditions:** Mock scenario: 4 days this week have logged kcal within 1850–2150; 3 days do not

**Steps:**
1. View the weekly corridor summary in Meal tracking.

**Expected result:**
- Summary shows: "4 / 7 days on target" (or equivalent)

**Status:** 🚫

---

### TC-MLT-014: Daily nutrition progress percentages
**AC:** US-PC-009 — consumed macros shown as % of target  
**Priority:** High

**Test data:** User u-001: calorie target 2000 kcal; macros protein 30% (150 g), fat 35% (78 g), carbs 35% (175 g)  
**Preconditions:** Log entries: Greek yogurt 200 g + Berry overnight oats 1 serving → total kcal 502

**Steps:**
1. View daily nutrition progress in Meal tracking.

**Expected result:**
- kcal consumed: 502 → **25%** of 2000 target shown
- Protein: ~35 g → ~23% of 150 g target shown
- Fat: ~8.8 g → ~11% of 78 g target shown
- Carbs: ~72 g → ~41% of 175 g target shown
- Percentage values update when a new entry is added or removed

**Status:** 🚫

---

## TC-AUTH — Authentication

**Requirement:** [`08_authentication.md`](../requirements/08_authentication.md)  
**User stories:** [`authentication.md`](../user-stories/authentication.md) — US-AUTH-001 – US-AUTH-007  
**Test data:** User u-001 (registered); user u-002 (registered, different email); user u-003 (no diet set)

---

### TC-AUTH-001: Registration form is accessible without sign-in
**AC:** US-AUTH-001 — registration form reachable by unauthenticated visitors  
**Priority:** High

**Preconditions:** No user is signed in

**Steps:**
1. Navigate to the app root.
2. Locate the registration / sign-up option.

**Expected result:**
- Registration form is accessible without credentials
- Form contains at minimum an email field and a password field

**Status:** 🚫

---

### TC-AUTH-002: Registration — validation rejects empty fields and short passwords
**AC:** US-AUTH-001 — empty fields rejected; passwords < 8 chars rejected  
**Priority:** High

**Steps (empty fields):**
1. Open registration form.
2. Submit without filling any fields.

**Expected result:**
- Submission blocked; error shown for each empty required field

**Steps (short password):**
3. Enter a valid email and a 7-character password; submit.

**Expected result:**
- Submission blocked; clear validation message states minimum password length (8 characters)

**Status:** 🚫

---

### TC-AUTH-003: Registration — duplicate email rejected without enumeration
**AC:** US-AUTH-001 — duplicate email rejected; error does not confirm address exists  
**Priority:** High

**Test data:** Email already registered to u-001

**Steps:**
1. Submit registration form with an email already in use.

**Expected result:**
- Registration is rejected
- Error message does not confirm whether the address is already registered (e.g. "If this email is available, your account has been created" or equivalent)

**Status:** 🚫

---

### TC-AUTH-004: Successful registration signs user in and lands on Planner
**AC:** US-AUTH-001 — successful registration auto signs in and redirects to Planner  
**Priority:** High

**Steps:**
1. Submit registration form with a unique email and password of 8+ characters.

**Expected result:**
- Account created
- User is signed in automatically
- Landing view is Planner (not sign-in screen)

**Status:** 🚫

---

### TC-AUTH-005: Sign in with correct credentials
**AC:** US-AUTH-002 — correct email + password grants access and lands on Planner  
**Priority:** High

**Preconditions:** Signed out

**Steps:**
1. Navigate to sign-in screen.
2. Enter email and password for u-001.
3. Submit.

**Expected result:**
- Access granted; landing view is Planner
- Sidebar and topbar are visible

**Status:** 🚫

---

### TC-AUTH-006: Sign in with wrong credentials shows generic error
**AC:** US-AUTH-002 — incorrect credentials show a generic error (no email/password specificity)  
**Priority:** High

**Steps:**
1. Enter a valid email and an incorrect password.
2. Submit.

**Expected result:**
- Access denied
- Error message is generic (e.g. "Invalid email or password") — does not specify which field is wrong

**Status:** 🚫

---

### TC-AUTH-007: Sign in — rate limiting after repeated failures
**AC:** US-AUTH-002 — account locked or rate-limited after configurable number of consecutive failures  
**Priority:** Medium

**Steps:**
1. Repeatedly submit wrong credentials for the same email address until the configured threshold is reached.

**Expected result:**
- After the threshold, sign-in attempts are blocked or delayed
- Message indicates when the user can try again (or how to unlock)

**Status:** 🚫

---

### TC-AUTH-008: Sign out — session invalidated, back button does not restore session
**AC:** US-AUTH-003 — sign out accessible from anywhere; session invalidated; back button does not restore  
**Priority:** High

**Preconditions:** Signed in as u-001

**Steps:**
1. Trigger sign-out action from the navigation or profile area.
2. Verify redirect to sign-in screen.
3. Press the browser back button.

**Expected result:**
- Redirect to sign-in after sign-out
- Back button does not return to an authenticated view; user remains on sign-in or is redirected there

**Status:** 🚫

---

### TC-AUTH-009: Password reset — link sent; no enumeration; link is single-use and expiring
**AC:** US-AUTH-004 — "Forgot password?" available; reset link sent; confirmation identical for registered and unregistered emails; link single-use and expires  
**Priority:** High

**Steps:**
1. Click **"Forgot password?"** on the sign-in screen.
2. Submit with the email of u-001 (registered).
3. Note the confirmation message.
4. Submit with a non-existent email.

**Expected result:**
- Confirmation message is identical in both cases (no enumeration)
- A reset link is sent to u-001's inbox (or captured by the test harness)
- Following the reset link opens a form to set a new password
- Following the same link a second time (after it has been used) shows an "expired or already used" message

**Status:** 🚫

---

### TC-AUTH-010: Unauthenticated access to protected routes redirects to sign-in
**AC:** US-AUTH-006 — direct URL to any protected route redirects to sign-in; after sign-in redirects to originally requested URL  
**Priority:** High

**Preconditions:** Signed out

**Steps:**
1. Navigate directly to a protected route (e.g. `/planner` or `/products`).
2. Sign in.

**Expected result:**
- Step 1: Redirected to sign-in screen; no application data visible
- Step 2: After sign-in, redirected to the originally requested URL (not the default Planner), or to Planner if no specific URL was requested

**Status:** 🚫

---

### TC-AUTH-011: Session persists across page reloads
**AC:** US-AUTH-005 — session persists within the same browser session without re-authentication  
**Priority:** Medium

**Preconditions:** Signed in as u-001

**Steps:**
1. Reload the browser tab.
2. Navigate between several modules.

**Expected result:**
- No re-authentication required within the same browser session
- All previously visible data remains accessible after reload

**Status:** 🚫

---

## Test data quick reference

| Item | ID | Key field |
|---|---|---|
| Greek yogurt | p-001 | 88 kcal / 150 g, Dairy |
| Rolled oats | p-008 | thisWeek: true, 150 kcal / 40 g |
| Atlantic salmon | p-005 | 208 kcal / 100 g, Fish |
| Whole eggs | p-027 | used in r-002 & r-003 — deletion blocked |
| Hemp seeds | p-026 | isUserAdded: true, userId: u-001 |
| Berry overnight oats | r-001 | favorite: true, thisWeek: true, Mon Breakfast seed |
| Chicken quinoa bowl | r-004 | favorite: true, thisWeek: true, Mon Lunch seed |
| Lentil tomato soup | r-006 | Tue Dinner seed |
| Turkey meatballs | r-009 | isUserAdded: true, Sun Dinner seed — deletion blocked |
| Primary test user | u-001 | Mediterranean, 2000 kcal, 30/35/35 macros |
| Keto user | u-002 | Ketogenic, 1800 kcal, 25/70/5 macros |
| Empty profile user | u-003 | No diet, no demographics |
