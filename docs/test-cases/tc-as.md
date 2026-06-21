# Test Cases — TC-AS: Advanced Search

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

**Requirement:** [`10_advanced_search.md`](../requirements/10_advanced_search.md)  
**User stories:** [`advanced-search.md`](../user-stories/advanced-search.md) — US-AS-001 – US-AS-014  
**Test data:** Products p-001 – p-028 and recipes r-001 – r-012 from seed data

---

### TC-AS-001: Opening Advanced Search shows empty state
**AC:** US-AS-001 — filter panel visible; no results until a filter or query is applied  
**Priority:** High

**Preconditions:** User is signed in; no previous Advanced Search state

**Steps:**
1. Click **Advanced search** in the sidebar.

**Expected result:**
- Filter sidebar is visible with all controls empty
- No product or recipe rows are shown
- An empty-state prompt is displayed (e.g. "Enter a search term or apply a filter to find products and recipes")
- Both Products and Recipes tab badges show 0 or are unaffected until a filter is applied

**Status:** ✅

---

### TC-AS-002: Search by name filters both tabs simultaneously
**AC:** US-AS-002 — partial, case-insensitive name match; both tabs update as the user types  
**Priority:** High

**Test data:** Query: "oat" — should match "Rolled oats" (product) and "Berry overnight oats" (recipe)

**Steps:**
1. Open Advanced Search.
2. Type `oat` in the name search input.

**Expected result:**
- Products tab shows products whose names contain "oat" (e.g. Rolled oats)
- Recipes tab shows recipes whose names contain "oat" (e.g. Berry overnight oats)
- Count badges on both tabs update to reflect the number of matches
- Clearing the input restores the empty state

**Status:** ✅

---

### TC-AS-003: Diet filter restricts both tabs to compatible items
**AC:** US-AS-003 — selecting a diet shows only tagged products and recipes  
**Priority:** High

**Test data:** Select diet "Ketogenic"; expect only keto-tagged items

**Steps:**
1. Open Advanced Search.
2. In the Diet filter dropdown, select **Ketogenic**.

**Expected result:**
- Products tab shows only products with `dietTags` containing the keto tag
- Recipes tab shows only recipes with `dietTags` containing the keto tag
- Items without the keto tag are hidden
- Switching diet to "Any diet" restores the full result set (if no other filter active, the empty state returns)

**Status:** ✅

---

### TC-AS-004: Calorie range filter — min and max
**AC:** US-AS-004 — min kcal, max kcal, and both together narrow results per-serving  
**Priority:** High

**Test data:** Greek yogurt (p-001): 88 kcal; Atlantic salmon (p-005): 208 kcal; Rolled oats (p-008): 150 kcal

**Steps (min only):**
1. Open Advanced Search with no other filters.
2. Set kcal **From** = 150.

**Expected result:** Products with kcal ≥ 150 shown; Greek yogurt (88 kcal) excluded.

**Steps (max only):**
3. Clear min. Set kcal **To** = 100.

**Expected result:** Products with kcal ≤ 100 shown; Atlantic salmon (208 kcal) and Rolled oats (150 kcal) excluded.

**Steps (range):**
4. Set **From** = 100 and **To** = 160.

**Expected result:** Products with 100 ≤ kcal ≤ 160 shown; items outside range excluded.

**Status:** ✅

---

### TC-AS-005: Macro range filter — protein example
**AC:** US-AS-005 — independent min/max per macro; per-serving values  
**Priority:** Medium

**Test data:** Atlantic salmon (p-005): 20 g protein; Greek yogurt (p-001): 9 g protein

**Steps:**
1. Open Advanced Search.
2. Set Protein **From** = 15.

**Expected result:**
- Products tab shows only products with protein ≥ 15 g per serving
- Greek yogurt (9 g) is excluded; Atlantic salmon (20 g) is included

**Steps (combined macros):**
3. Also set Fat **To** = 5.

**Expected result:**
- Filters combine with AND: items must have protein ≥ 15 g AND fat ≤ 5 g
- Atlantic salmon (13 g fat) is excluded; only items meeting both constraints remain

**Status:** ✅

---

### TC-AS-006: Category multi-select — OR logic within filter, AND with other filters
**AC:** US-AS-006 — multiple categories show items from any selected category (OR); combines AND with other filters  
**Priority:** High

**Steps:**
1. Open Advanced Search.
2. In the Category section, check **Dairy** (under Products).

**Expected result:** Products tab shows only Dairy products.

**Steps:**
3. Also check **Fish** (under Products).

**Expected result:** Products tab shows Dairy AND Fish products (OR logic within category filter).

**Steps:**
4. Add kcal **From** = 150.

**Expected result:** Products tab shows only Dairy or Fish products that also have kcal ≥ 150 (AND across filter types).

**Status:** ✅

---

### TC-AS-007: Ingredient filter applies to Recipes tab only
**AC:** US-AS-007 — ingredient text filter; applies only to Recipes tab; Products tab unaffected  
**Priority:** Medium

**Test data:** Type "egg" — matches recipes that include "Whole eggs" (p-027) as an ingredient

**Steps:**
1. Open Advanced Search.
2. Type `egg` in the "Contains ingredient" field.

**Expected result:**
- Recipes tab shows only recipes that contain an ingredient matching "egg" (partial match)
- Products tab is **not** affected — it shows the same products as before (or empty state if no other filter)
- The filter chip or active filter indicator shows the ingredient constraint

**Status:** ✅

---

### TC-AS-008: Both tabs show count badges; switching tab does not reset filters
**AC:** US-AS-008 — two tabs always visible; count badges update; tab switch preserves filters  
**Priority:** High

**Steps:**
1. Open Advanced Search and type a query that returns results in both tabs (e.g. `a`).
2. Note the counts on the Products and Recipes badges.
3. Click the **Recipes** tab.
4. Click the **Products** tab.

**Expected result:**
- Both tab headers show numeric badges reflecting match counts
- Switching between tabs does not clear any filter or search query
- The count on each tab matches the number of visible rows in that tab

**Status:** ✅

---

### TC-AS-009: Sort product results by column header
**AC:** US-AS-009 — sortable column headers with ↑/↓ indicator; sort applies to filtered set  
**Priority:** Medium

**Test data:** At least 3 products visible (e.g. after typing a single letter)

**Steps:**
1. Open Advanced Search; type `a` to show multiple products.
2. Click the **kcal** column header.

**Expected result:**
- Products sorted ascending by kcal; ↑ indicator appears on kcal header

**Steps:**
3. Click the **kcal** header again.

**Expected result:**
- Products sorted descending by kcal; ↓ indicator appears

**Steps:**
4. Click the **Name** header.

**Expected result:**
- Products sorted ascending by name alphabetically; active indicator moves to Name

**Status:** ✅

---

### TC-AS-010: Sort recipe results by column header
**AC:** US-AS-010 — sortable column headers in Recipes tab; sort state independent from Products tab  
**Priority:** Medium

**Steps:**
1. Open Advanced Search; type `a` to show multiple recipes. Switch to the **Recipes** tab.
2. Click the **kcal** column header.
3. Switch to Products tab. Note the sort state there.
4. Switch back to Recipes tab.

**Expected result:**
- Recipes are sorted by kcal ascending (↑ indicator)
- The Products tab sort state is unaffected by changes made in the Recipes tab
- Returning to Recipes tab shows the same sort (kcal ascending) still applied

**Status:** ✅

---

### TC-AS-011: Mark product "This week" from search results
**AC:** US-AS-011 — TW/NW buttons in each product row; toggling mirrors the flag in All products  
**Priority:** High

**Test data:** Rolled oats (p-008) — already thisWeek: true in seed data; use another product that is not flagged (e.g. Atlantic salmon p-005)

**Steps:**
1. Open Advanced Search; type `salmon` to show Atlantic salmon.
2. Click the **TW** button in the Atlantic salmon row.
3. Navigate to **Planner > Week summary**.

**Expected result:**
- TW button for Atlantic salmon becomes highlighted (active)
- Atlantic salmon appears in the Planner Weekly summary (Lunch slot)
- Navigating to All Products and finding Atlantic salmon confirms its "This week" flag is active

**Status:** ✅

---

### TC-AS-012: Mark recipe "Next week" from search results
**AC:** US-AS-011 — NW button in recipe row; mirrors flag in recipe catalogue  
**Priority:** Medium

**Test data:** Any recipe not currently flagged for next week (e.g. Lentil tomato soup r-006)

**Steps:**
1. Open Advanced Search; switch to the **Recipes** tab; type `lentil`.
2. Click the **NW** button in the Lentil tomato soup row.
3. Navigate to **Recipes** view.

**Expected result:**
- NW button becomes highlighted in the search result row
- In the Recipes view, Lentil tomato soup shows its "Next week" flag as active

**Status:** ✅

---

### TC-AS-013: Active filter chip removes individual filter
**AC:** US-AS-012 — active filters shown as chips; × on each chip removes only that filter  
**Priority:** Medium

**Steps:**
1. Open Advanced Search. Set diet filter = Ketogenic AND kcal min = 100.
2. Observe the chip area above the results.
3. Click × on the **Diet: Ketogenic** chip.

**Expected result:**
- Diet filter is cleared; kcal min = 100 filter remains active
- Recipes and products filtered only by kcal ≥ 100 (not by diet)
- The Ketogenic chip disappears; the kcal chip remains

**Status:** ✅

---

### TC-AS-014: "Clear all" resets all filters and the search input
**AC:** US-AS-012 — Clear all resets everything; empty state returns if no other interaction  
**Priority:** Medium

**Steps:**
1. Apply multiple filters (diet, calorie min, a category) and type a query.
2. Click **Clear all**.

**Expected result:**
- All filters reset to empty/default
- Search input cleared
- Empty state message is displayed (no results shown)
- All chip tags disappear

**Status:** ✅

---

### TC-AS-015: Filters reset when navigating away and returning
**AC:** US-AS-012 — filters do not persist across navigation  
**Priority:** Medium

**Steps:**
1. Open Advanced Search; apply a diet filter and type a query; confirm results appear.
2. Click **Products** in the sidebar (navigate away).
3. Click **Advanced search** in the sidebar (return).

**Expected result:**
- Advanced Search reopens in the empty state
- All previous filters are cleared; no results are shown
- The filter panel is blank

**Status:** ✅

---

### TC-AS-016: Click product row opens product detail modal
**AC:** US-AS-013 — clicking a product row opens the detail card; dismissible without losing search state  
**Priority:** Medium

**Steps:**
1. Open Advanced Search; type `salmon` to show Atlantic salmon in Products tab.
2. Click the Atlantic salmon row.

**Expected result:**
- Product detail modal/panel opens showing: pie chart, macro values (protein, fat, carbs, kcal), units conversion table
- The search query `salmon` remains in the search input behind the modal
- Closing the modal returns to the same search results

**Status:** ✅

---

### TC-AS-017: Click recipe row opens recipe detail modal
**AC:** US-AS-014 — clicking a recipe row opens the recipe detail card  
**Priority:** Medium

**Steps:**
1. Open Advanced Search; switch to Recipes tab; type `overnight` to show Berry overnight oats.
2. Click the Berry overnight oats row.

**Expected result:**
- Recipe detail modal opens showing: pie chart, macro values, ingredients list, kcal per serving
- If instructions are present, they are shown; if prep time is present, it is shown
- Closing the modal returns to the same search results

**Status:** ✅

---

### TC-AS-018: No results in one tab does not hide results in the other
**AC:** US-AS-008 — each tab shows its own empty state; the other tab may still have results  
**Priority:** Medium

**Test data:** Search for `salmon` — matches a product but no recipe

**Steps:**
1. Open Advanced Search; type `salmon`.
2. Note the Products tab result count.
3. Switch to the Recipes tab.

**Expected result:**
- Products tab shows matching products (e.g. Atlantic salmon)
- Recipes tab shows "No recipes match your filters." (empty state for that tab)
- Both tabs remain accessible; the count badge for Recipes shows 0

**Status:** ✅

---

### TC-AS-019: Multiple filters combine with AND logic
**AC:** US-AS-002 – US-AS-007 — all active filters narrow the result set (AND logic across filter types)  
**Priority:** High

**Steps:**
1. Open Advanced Search. Set diet = Mediterranean AND kcal From = 100 AND type `a` in search.

**Expected result:**
- Products tab shows only products where: name contains "a" AND diet tag includes Mediterranean AND kcal ≥ 100
- Each additional filter further narrows the result (result count ≤ any individual filter's count)
- Removing one filter expands the result set accordingly

**Status:** ✅

---

### TC-AS-020: Mark recipe as favourite from search results
**AC:** US-AS-014 (recipe detail and actions) — all recipe actions from Recipe Analyser should be available in Advanced Search  
**Priority:** Low

**Steps:**
1. Open Advanced Search; switch to Recipes tab; find a non-favourite recipe.
2. Attempt to mark it as favourite (from the row or the detail modal).

**Expected result:**
- A favourite toggle is available in the recipe row or detail modal
- Toggling marks the recipe as favourite; the heart icon becomes filled
- Navigating to the Recipes view confirms the favourite status was persisted

**Status:** 🚫  
**Note (prototype):** The favourite heart icon is shown in the row when already favourited, but there is no toggle button to change the favourite state from SearchView. Favouriting from search results is not yet implemented.
