# Test Cases — TC-PRD: Products Database

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

**Requirement:** [`01_products-database.md`](../requirements/01_products-database.md)  
**User stories:** [`products-database.md`](../user-stories/products-database.md)  
**Test data:** Products p-001 – p-028 from test-data.json

> **Dataset assumptions.** Cases TC-PRD-001–034 exercise the **prototype seed dataset**
> (`test-data.json`, p-001–p-028) — curated products with populated `dietTags`, short
> names, and diverse categories. The **production catalog is bulk-imported from USDA
> FoodData Central** (ADR-0013), which differs in ways that affect these cases:
> diet tags are **empty** for imported products (diet-tag search/filter returns nothing),
> names are long and comma-style ("Milk, whole, …"), display names may repeat across
> distinct products, and ~9% carry 0 kcal. Cases that depend on diet tags or specific
> product names (e.g. TC-PRD-006, TC-PRD-010) are **prototype-only** unless re-based on
> imported data. API-level cases (TC-PRD-035–037) run against either dataset.

---

### TC-PRD-001: Products view shows only products
**AC:** US-PA-001 — product list is scoped to products only  
**Priority:** High

**Steps:**
1. Click **Products** in the sidebar.

**Expected result:**
- Only items with `kind = product` are shown
- No recipe cards are visible (e.g. "Berry overnight oats" must not appear)
- All 28 products from seed data visible (or a count badge confirms 28)

**Status:** ✅

---

### TC-PRD-002: Products opens in category cards view by default
**AC:** US-PA-008 — category cards view is the default; no search or filter controls visible in this view  
**Priority:** High

**Steps:**
1. Click **Products** in the sidebar (fresh navigation, no previous state).

**Expected result:**
- Products view opens in **category cards view** (not list view)
- One card per product category is shown (Dairy, Fish, Grains, Legumes, etc.)
- No search bar visible
- No filter controls (category filter, diet filter, Mine toggle) visible

**Status:** ✅

---

### TC-PRD-003: Switch to list view from category cards
**AC:** US-PA-008 — toggle switches to list view; list shows name, category, protein, fat, carbs, fiber, kcal, serving size columns  
**Priority:** Medium

**Preconditions:** Products view open in category cards view (default)

**Steps:**
1. Click the **list-view toggle** in the control band.

**Expected result:**
- Layout switches to a table
- Search bar and filter controls appear
- Columns visible: Name, Category, Protein (g), Fat (g), Carbs (g), Fiber (g), kcal, Serving size
- **Atlantic salmon** (p-005) row shows: Fish, 20 g protein, 13 g fat, 0 g carbs, 0 g fiber, 208 kcal, 100 g serving

**Status:** ✅

---

### TC-PRD-004: Click a category card — opens list filtered to that category
**AC:** US-PA-009 — clicking category card navigates to filtered list; category filter pre-set  
**Priority:** Medium

**Preconditions:** Products view open in category cards view

**Steps:**
1. Click the **Dairy** category card.

**Expected result:**
- View switches to list view showing only Dairy products
- Category filter is pre-set to "Dairy"
- Dairy products shown: Greek yogurt, Whole milk, Cheddar cheese, Butter, Whole eggs (5 items)
- A "back" or breadcrumb control is visible to return to category cards view

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
**Dataset:** Prototype seed only — imported USDA products have empty diet tags, so this case yields no matches against the production catalog.

**Steps:**
1. Type `keto` in the search box.

**Expected result:**
- Products tagged with "keto" shown: Greek yogurt, Cheddar cheese, Butter, Atlantic salmon, Tuna in water, Sardines, Baby spinach, Broccoli, Avocado, Chicken breast, **Ground turkey**, **Beef sirloin**, Almonds, Olive oil, Whole eggs (15 items — verify against test-data.json `dietTags` arrays)
- Products with no keto tag (e.g. Banana, Brown rice, Red lentils) are hidden

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
- All 28 products shown (or full unfiltered count)

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
**Dataset:** Prototype seed only — imported USDA products have empty diet tags (diet filter returns nothing against the production catalog until diet-tag enrichment lands).

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
- Only **Hemp seeds** (p-026) and **Flax seeds** (p-028) visible (both `isUserAdded: true, userId: "u-001"`)
- System products (`isUserAdded: false`) hidden

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

**Test data:** **Flax seeds** (p-028, `isUserAdded: true, userId: "u-001"`) is used in:
- Turkey meatballs (r-009): 15 g

**Steps:**
1. Toggle the **Mine** filter to show only user-added products.
2. Locate **Flax seeds** (p-028) in the list.
3. Click the **delete** (×) button on Flax seeds.

**Expected result:**
- Deletion is blocked — Flax seeds is not removed from the list
- Error message or blocking prompt lists recipes referencing the product (at minimum: "Turkey meatballs")
- Flax seeds remains visible in the list

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

### TC-PRD-024: Category cards view shows one card per category with item counts
**AC:** US-PA-009 — category cards shows all categories with item counts  
**Priority:** High

**Preconditions:** Products view open in category cards view (default)

**Steps:**
1. Observe the category cards grid.

**Expected result:**
- One card per distinct category (Dairy, Fish, Grains, Produce, Meat, Legumes, Nuts & Seeds, Condiments) — 8 cards total
- Each card shows the category name and the count of products in that category (e.g. Dairy: 5, Fish: 3, Grains: 4, Produce: 5, Meat: 3, Legumes: 3, Nuts & Seeds: 4, Condiments: 1)
- No individual products shown in the grid — only category cards

**Status:** ✅

---

### TC-PRD-025: Return to category cards view via toggle from list view
**AC:** US-PA-008 — toggle is reversible; category cards view is accessible from list view  
**Priority:** Medium

**Preconditions:** Products in list view (toggle from default category view)

**Steps:**
1. Click the **category-view toggle** to switch back to category cards.

**Expected result:**
- Category cards grid shown
- Search bar and filters are hidden again
- Individual product rows are no longer visible

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
- For a user-added product with alternative units (e.g. from TC-PRD-028), the conversion table also shows a row for each defined altUnit (e.g. 1 tbsp = 10 g) alongside the base and serving rows
- Close button dismisses the modal

**Status:** ✅

---

### TC-PRD-027: Sort product list by column
**AC:** US-PA-011 — column headers toggle ascending/descending sort  
**Priority:** Medium

**Preconditions:** Products view in list view

**Steps:**
1. Click the **kcal** column header once.
2. Click the **kcal** column header again.

**Expected result:**
- After step 1: Products sorted by kcal ascending (lowest kcal first; Greek yogurt 88 kcal near the top)
- After step 2: Products sorted by kcal descending (highest kcal first; Butter ~718 kcal near the top)
- The active sort column shows an arrow/indicator

**Status:** ✅

---

### TC-PRD-028: Define multiple alternative units with correct label and unit dropdown
**AC:** US-PA-012 — product form accepts multiple units; unit is selected from dropdown; label = "grams per [unit]"  
**Priority:** Medium

**Preconditions:** Add product form open

**Steps:**
1. Click **"Add product"**.
2. Click the unit selector for the first alternative unit.
3. Observe the available options.
4. Select **tbsp** from the dropdown.
5. Observe the conversion input label.
6. Add a second alternative unit and select **cup** from the dropdown.
7. Observe its conversion input label.

**Expected result:**
- Step 3: Unit type is a **dropdown** with predefined options (g, kg, ml, l, oz, lb, fl oz, cup, tbsp, tsp, pc, serving). Free-text entry is not available.
- Step 5: Conversion field labelled **"grams per tbsp"**
- Step 7: Second conversion field labelled **"grams per cup"**
- Both alternative units can be saved together on the same product

**Status:** ✅

---

### TC-PRD-029: Next-week flag auto-promotes to this-week on week rollover
**AC:** US-PA-007 — on Monday of a new week, items flagged "Next week" become "This week"  
**Priority:** Medium

**Preconditions:** **Quinoa** (p-010) has `thisWeek: false`, `nextWeek: true`.  
*Set up:* First run TC-PRD-015 steps 1–2 to toggle the Next week flag on Quinoa (seed data ships with both flags false).

**Steps:**
1. Simulate a week rollover: advance the application's reference date to the following Monday (or trigger the rollover mechanism if exposed in the prototype).
2. Navigate to **All Products** and locate Quinoa.

**Expected result:**
- Quinoa now shows "This week" flag active
- "Next week" flag is cleared on Quinoa
- Quinoa appears in the Planner Lunch slot for the new current week

**Status:** 🚫

---

### TC-PRD-030: Add product — 100-char name and extreme numeric values (EDGE-PRD-002)
**AC:** US-PA-005 — form handles boundary-length names and large values without crashing  
**Priority:** Low

**Test data:** `formInputs.productForm.edgeCases[1]` (EDGE-PRD-002)
```
name: "Aaaaaaa…" (100 characters)
category: Dairy, unit: g, servingAmount: 9999
kcal: 9999, protein: 999, fat: 999, carbs: 999
```

**Steps:**
1. Click **"Add product"**.
2. Fill in EDGE-PRD-002 values.
3. Submit.

**Expected result:**
- Product is either saved successfully and appears in the list with the full 100-char name (truncated with ellipsis if UI clips it), **or** a clear max-length validation message is shown
- Very large numeric values either display correctly or trigger a meaningful validation error
- No crash or unhandled error

**Status:** ✅

---

### TC-PRD-031: Add product — Unicode and emoji in product name (EDGE-PRD-003)
**AC:** US-PA-005 — form accepts and renders non-ASCII characters correctly  
**Priority:** Low

**Test data:** `formInputs.productForm.edgeCases[2]` (EDGE-PRD-003)
```
name: "Special chars: café & naïve 🥑"
category: Produce, unit: g, servingAmount: 100, kcal: 80
```

**Steps:**
1. Click **"Add product"**.
2. Enter EDGE-PRD-003 values.
3. Submit.

**Expected result:**
- Product saved; name renders correctly on the product card (accented chars and emoji visible, not garbled)
- Mine filter shows the new product

**Status:** ✅

---

### TC-PRD-032: Add product — non-numeric text in numeric fields (INVALID-PRD-003)
**AC:** US-PA-005 — numeric fields reject non-numeric input  
**Priority:** Medium

**Test data:** `formInputs.productForm.invalid[2]` (INVALID-PRD-003)
```
name: "Text in numbers"
servingAmount: "abc", kcal: "lots", protein: "much", fat: "fat", carbs: "many"
```

**Steps:**
1. Click **"Add product"**.
2. Enter "Text in numbers" as name.
3. Type `abc` into the serving amount field, `lots` into kcal, etc.
4. Click submit.

**Expected result:**
- Browser / form validation prevents submission
- Affected fields show a validation error (type="number" inputs reject non-numeric input)
- Product not saved

**Status:** ✅

---

### TC-PRD-033: "Next week" filter narrows list to next-week products only
**AC:** US-PA-007 — "Next week" filter toggle shows only products with nextWeek flag  
**Priority:** Medium

**Preconditions:** Quinoa (p-010) has `nextWeek: true` (run TC-PRD-015 step 1 to set this flag first).

**Steps:**
1. In Products list view, toggle the **"Next week"** filter button.

**Expected result:**
- Only **Quinoa** (p-010) visible (the only seed product with nextWeek: true after the precondition step)
- All other products are hidden
- Toggling the filter off restores the full product list

**Status:** ✅

---

### TC-PRD-034: Mark product "This week" from list view
**AC:** US-PA-007 — TW/NW buttons visible and functional in list view rows  
**Priority:** High

**Preconditions:** Products view switched to **list view**; **Atlantic salmon** (p-005) has `thisWeek: false`

**Steps:**
1. Switch to list view.
2. Locate Atlantic salmon; click its **TW** button.
3. Navigate to **Planner > Week summary**.

**Expected result:**
- TW button in the Atlantic salmon row becomes highlighted (active, teal)
- Atlantic salmon appears in the **Lunch** slot of the weekly summary
- Navigating back confirms TW remains active

**Status:** ✅

---

### TC-PRD-035: Product name localization with English fallback (API)
**AC:** US-PA-013 — localized names, English fallback (ADR-0012, FR-037)
**Priority:** High
**Level:** API / backend

**Preconditions:** A product has an `en` name ("Whole Milk") and a `de` name ("Vollmilch"); a second product has only an `en` name.

**Steps:**
1. `GET /products?locale=de` and inspect the first product's `name`.
2. `GET /products?locale=de` for the product that has no German translation.
3. `GET /products?locale=de&search=vollm`.

**Expected result:**
- Product with a German translation returns "Vollmilch".
- Product without one returns its English name (no error, no blank).
- Search matches the resolved (localized) name.

**Automated:** `backend/catalog/tests/test_localization.py`
**Status:** ✅

---

### TC-PRD-036: USDA catalog import is idempotent (API)
**AC:** US-PA-014 — bulk import of global products, idempotent (ADR-0013, FR-038)
**Priority:** High
**Level:** API / backend

**Preconditions:** A USDA FoodData Central CSV export directory is available.

**Steps:**
1. Run `python -m importer --dir <fdc_csv_dir>` against an empty catalog.
2. Run the same import a second time.
3. Inspect global products (`source='usda_fdc'`).

**Expected result:**
- First run inserts global products with per-100 g nutrition, units (≤ 10), and an English name.
- Second run updates in place — no duplicate products (max one row per `external_id`).
- User-added products (`source` NULL) are untouched.

**Automated:** `backend/catalog/tests/test_import.py`
**Status:** ✅

---

### TC-PRD-037: Product list pagination (API)
**AC:** FR-011 / NFR-002 — paginated catalog reads at scale (ADR-0012)
**Priority:** High
**Level:** API / backend
**Dataset:** Either — needs enough products to exceed one page (e.g. imported USDA catalog).

**Preconditions:** The catalog holds more than one page of products (e.g. > 50).

**Steps:**
1. `GET /products?limit=10&offset=0` and note `items` and `total`.
2. `GET /products?limit=10&offset=10&sort_by=name`.
3. `GET /products?limit=10&offset=<very large, past the end>`.
4. `GET /products?limit=0` and `GET /products?limit=201`.

**Expected result:**
- Each page returns at most `limit` items; `total` reflects the full match count, not the page size.
- Consecutive pages (offset 0 vs 10) return disjoint items under a stable sort.
- An offset past the end returns `items: []` with `total` unchanged.
- `limit` below 1 or above 200 is rejected with **422** (contract guard, not silent clamp).

**Automated:** `backend/catalog/tests/test_localization.py` (`TestPagination`)
**Status:** ✅
