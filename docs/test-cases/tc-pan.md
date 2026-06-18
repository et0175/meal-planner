# Test Cases — TC-PAN: Products Analyser

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

**Requirement:** [`02_products-analyser.md`](../requirements/02_products-analyser.md)  
**User stories:** [`products-analyser.md`](../user-stories/products-analyser.md)

---

### TC-PAN-001: Analyser opens empty
**AC:** US-PAN-001 — spreadsheet-like list view, empty by default  
**Priority:** High  
**Status:** ✅

---

### TC-PAN-002: Add a row — product selector filters as user types
**AC:** US-PAN-002 — Column 1 narrows list from All products  
**Priority:** High  
**Test data:** Type "Salmon" → should suggest **Atlantic salmon** (p-005)  
**Status:** ✅

---

### TC-PAN-003: Unit dropdown shows only units the product has a conversion for
**AC:** US-PAN-003 — Column 2 shows only units with defined conversions for the selected product  
**Priority:** Medium  
**Test data:**
- **Atlantic salmon** (p-005): base unit g, no altUnits → expect only: g, serving
- **Chia seeds** (p-024): base unit g, altUnits=[{unit:'tbsp'}] → expect: g, tbsp, serving
- **Rolled oats** (p-008): base unit g, altUnits=[{unit:'cup'}] → expect: g, cup, serving

**Steps:**
1. Open Products analyser and add a row.
2. Select **Atlantic salmon** (p-005).
3. Inspect the unit dropdown options.
4. Replace with **Chia seeds** (p-024) and inspect again.
5. Replace with **Rolled oats** (p-008) and inspect again.

**Expected result:**
- Atlantic salmon: only **g** and **serving** are available — no ml, pc, tbsp, tsp, cup
- Chia seeds: **g**, **tbsp**, and **serving** available — no ml, pc, tsp, cup
- Rolled oats: **g**, **cup**, and **serving** available — no ml, pc, tbsp, tsp

**Status:** ✅

---

### TC-PAN-004: Nutrition calculated live
**AC:** US-PAN-004 — calculated columns (protein, fat, carbs, kcal) update immediately on any change  
**Priority:** High  
**Test data:** Select Atlantic salmon (p-005), unit=g, qty=150 → expected: protein 30 g, fat 19.5 g, carbs 0, kcal 312  
**Status:** ✅

---

### TC-PAN-005: Totals row sums all rows
**AC:** US-PAN-005 — Totals row shows sum of each nutrient column  
**Priority:** High  
**Test data:** Row 1: Atlantic salmon 100 g (kcal 208); Row 2: Greek yogurt 150 g (kcal 88) → total kcal = 296  
**Status:** ✅

---

### TC-PAN-006: Per-100 g row normalises totals
**AC:** US-PAN-005 — "Per 100 g" row shows nutrients scaled to 100 g of total weight  
**Priority:** Medium  
**Status:** ✅

---

### TC-PAN-007: Remove a row — totals update
**AC:** US-PAN-007 — row removal updates totals immediately; catalog flags unaffected  
**Priority:** Medium  
**Status:** ✅

---

### TC-PAN-008: Add new product from within analyser
**AC:** US-PAN-008 — user can add a product without leaving the analyser  
**Priority:** Low  
**Status:** 🚫

---

### TC-PAN-009: Select a recipe as a row item — unit and flags
**AC:** US-PAN-002, US-PAN-003, US-PAN-009 — recipe row shows unit dropdown (serving/grams) and flag columns  
**Priority:** High  
**Test data:** Type "Berry" → should suggest **Berry overnight oats** (r-001)

**Steps:**
1. Open Products analyser and add a row.
2. Type `berry` in Column 1.
3. Select **Berry overnight oats** from the suggestions.

**Expected result:**
- Row shows "Berry overnight oats" pinned in Column 1 (with "recipe" label)
- Column 2 (Unit) is a **dropdown offering "serving" (default) and "grams"**
- Column 3 (Quantity) defaults to 1
- Nutrition columns populate: kcal 385, protein 15 g, fat 8 g, carbs 65 g
- **"This week" and "Next week" flag columns are visible** for this recipe row

**Steps (unit change to grams):**
4. Change Column 2 to **grams**.
5. Enter quantity = 200 (g).

**Expected result:**
- Nutrition columns recalculate proportionally (kcal ≈ 385 × 200 / serving_weight)

**Status:** ✅

---

### TC-PAN-010: Search suggestions sorted — recently used → user owned → alphabetical
**AC:** US-PAN-002 — recently planned/logged first, then user-owned items, then alphabetical  
**Priority:** Medium

**Preconditions:** Seed assignments include Berry overnight oats (r-001) and Chicken quinoa bowl (r-004) in current week; Hemp seeds (p-026) and Flax seeds (p-028) are user-owned (isUserAdded: true, userId: u-001) and have no recent planner usage

**Steps:**
1. Open Products analyser and add a row.
2. Clear the search field and observe the default suggestions (or type a single generic character).

**Expected result:**
- **Berry overnight oats** and **Chicken quinoa bowl** (recently planned) appear first
- **Hemp seeds** (p-026) and **Flax seeds** (p-028) (user-owned, not recently used) appear after the recently-used group but before the full alphabetical list of system products
- System products with no recent usage appear below the user-owned group, sorted alphabetically
- The three-tier order (recently used → user owned → alphabetical) is maintained as the user types

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
4. Navigate to **All Products** and locate Broccoli.

**Expected result (analyser → catalog):**
- Broccoli shows "This week" flag as active in the Products list / card
- No duplicate entries; the state is mirrored, not duplicated

**Steps (catalog → analyser):**
5. In All Products, toggle Broccoli **"Next week"** ON.
6. Return to Products analyser; the Broccoli row still exists in the session.

**Expected result (catalog → analyser):**
- Broccoli row in analyser now shows "Next week" flag as active
- "This week" flag still active (both flags can be set independently)

**Status:** ✅

---

### TC-PAN-012: Recipe week-flag mirrors recipe catalog (bidirectional sync)
**AC:** US-PAN-009 — toggling "This week" / "Next week" on a recipe row mirrors in the recipe catalog, and vice versa  
**Priority:** High

**Preconditions:** **Lentil tomato soup** (r-006) has `thisWeek: false`, `nextWeek: false`

**Steps (analyser → catalog):**
1. Open Products analyser and add a row.
2. Select **Lentil tomato soup**.
3. Toggle **"This week"** ON on the recipe row.
4. Navigate to **Recipes** and locate Lentil tomato soup.

**Expected result (analyser → catalog):**
- Lentil tomato soup shows "This week" flag active in the recipe list / card

**Steps (catalog → analyser):**
5. In Recipes, toggle Lentil tomato soup **"Next week"** ON.
6. Return to Products analyser.

**Expected result (catalog → analyser):**
- Lentil tomato soup row in analyser now shows "Next week" flag as active
- "This week" flag still active (both flags can be set independently)

**Status:** ✅
