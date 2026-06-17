# Test Cases — TC-PRD: Products Database

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

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
**AC:** US-PA-008 — list view shows name, category, protein, fat, carbs, fiber, kcal, serving size columns  
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
