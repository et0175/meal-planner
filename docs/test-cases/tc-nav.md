# Test Cases — TC-NAV: Navigation

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

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
- Sidebar contains exactly 7 items in order: **Planner, All Products, Products analyser, Recipes, Diets, Shopping list, Personal cabinet**
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
