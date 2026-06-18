# Test Cases — TC-PLN: Meal Planner — Weekly Summary

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

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

### TC-PLN-003: Week summary has four meal slots
**AC:** US-MP-003 — four meal slots: Breakfast, Lunch, Dinner, Snacks  
**Priority:** High

**Steps:**
1. Open Planner > Week summary tab.

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
1. Open Week summary.

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
1. In Week summary, find **Chickpea curry** in the Lunch slot.
2. The Wednesday cell shows `2`. Change it to `3`.

**Expected result:**
- Wednesday cell shows `3`
- Calendar Wednesday Lunch slot reflects the change (3 servings)
- Topbar kcal total increases by 310 (1 extra serving of Chickpea curry)

**Status:** ✅

---

### TC-PLN-006: Zero a cell removes the assignment
**AC:** US-MP-003 — clearing or zeroing a cell removes the assignment  
**Priority:** High

**Steps:**
1. In Week summary, find **Berry overnight oats** Monday Breakfast cell (currently `1`).
2. Change the value to `0` (or clear it).

**Expected result:**
- Monday Breakfast cell is empty
- Calendar Monday Breakfast slot no longer shows Berry overnight oats

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

**Status:** ✅

---

### TC-PLN-008: Grams toggle not shown for items without servingG
**AC:** US-MP-005 — grams mode only available when gram weight per serving is defined  
**Priority:** Low

**Preconditions:** Add an item that has no `servingG` defined (e.g. a custom recipe with no weight data)

**Steps:**
1. Inspect the row for such an item.

**Expected result:**
- "g" toggle not shown or is disabled for that row

**Status:** ✅

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
3. Return to Planner > Week summary.

**Expected result:**
- Broccoli appears in the **Lunch** meal slot of the summary
- Not duplicated if already present

**Status:** ✅

---

### TC-PLN-012: Calendar day column shows kcal nutrition strip
**AC:** US-MP-019 — each day column in Calendar shows planned kcal and macros  
**Priority:** Medium

**Preconditions:** User u-001 has calorie target 2000 kcal; seed data loaded (Mon has r-001 385 kcal + r-004 450 kcal = 835 kcal)

**Steps:**
1. Open Planner > Calendar tab > Week sub-view.
2. Inspect the **Monday** column.

**Expected result:**
- Monday column shows a nutrition strip: **835 kcal**, protein (P), fat (F), carbs (C) totals
- Strip visible when the column has at least one assignment
- Empty columns do not show the strip

**Status:** ✅

---

### TC-PLN-013: Planner item search sorted — recently used → user owned → alphabetical
**AC:** US-MP-020 — search suggestions sorted: recently used first, then user-owned, then alphabetical  
**Priority:** Medium

**Preconditions:** Seed assignments include Berry overnight oats (r-001) and Chicken quinoa bowl (r-004); Hemp seeds (p-026) and Flax seeds (p-028) are user-owned but not recently used

**Steps:**
1. Open Planner > Week summary.
2. In any meal-slot row, click the item search input.
3. Observe default suggestions (no text typed or type a single generic letter).

**Expected result:**
- Berry overnight oats (r-001) and Chicken quinoa bowl (r-004) (recently planned) appear first
- Hemp seeds (p-026) and Flax seeds (p-028) (user-owned, not recently used) appear after the recently-used group but before system items
- System items with no recent usage appear last, sorted alphabetically
- The three-tier sort (recently used → user owned → alphabetical) is preserved as the user types

**Status:** 🚫

---

### TC-PLN-014: Switch between Week summary and Calendar tabs
**AC:** US-MP-002 — two tabs are visible; selecting a tab shows its content and hides the other; both tabs reflect the same underlying week  
**Priority:** High

**Steps:**
1. Open Planner; note the default active tab (Week summary).
2. Click **Calendar** tab.
3. Click **Week summary** tab.

**Expected result:**
- After step 1: Week summary content visible; Calendar hidden; "Week summary" tab highlighted
- After step 2: Calendar content visible; Week summary hidden; same assignments visible in calendar cells (Mon Breakfast: Berry overnight oats)
- After step 3: Week summary visible again; data consistent across tabs

**Status:** ✅

---

### TC-PLN-015: Download meal plan as PDF
**AC:** US-MP-022 — PDF download available in planner; contains full Week summary grid  
**Priority:** Medium

**Preconditions:** Current week loaded with seed assignments

**Steps:**
1. Open Planner > Week summary.
2. Locate the **"Download PDF"** button (in the planner header or Week summary toolbar).
3. Click it.

**Expected result:**
- A PDF file is downloaded (browser download triggered)
- The PDF contains the full Week summary grid: item names, meal slots, Mon–Sun columns with serving counts
- The selected week date range (e.g. "Mon 15 Jun – Sun 21 Jun") appears in the PDF header
- Seeded items (Berry overnight oats Mon Breakfast, Chicken quinoa bowl Mon Lunch, etc.) appear in the correct slots

**Status:** ✅
