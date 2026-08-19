# Test Cases — TC-DAY: Meal Planner — Grid View: Per-slot Day Editing

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

> **Note (2026-08-19):** The Planner's Calendar tab and its Day / 4 Days sub-views have been removed. The "Day" and "4 Days" sub-views never existed in the actual implementation and are dropped from the spec entirely. The per-slot, per-day editing experience this file covers now lives in the **Grid view** tab — a day × meal-slot matrix that is the direct functional descendant of the old "Week" sub-view. Tests below have been retargeted to Grid view; the TC-DAY ID prefix is kept for continuity with the existing naming convention. See also [`tc-cal.md`](tc-cal.md) for Grid view's viewing/summary-panel tests and [`tc-pln.md`](tc-pln.md) for Week summary and tab-switching tests.
>
> **Implementation gap found during this update:** Grid view's per-slot cell (`GridSlotCell` in `page.tsx`) supports add, remove, and drag-between-cells, but does **not** currently render +/− serving-count controls or a per-item "+ Log" action, even though [`06_meal_planner.md`](../requirements/06_meal_planner.md) Tab 2 specifies both. Both controls **are** implemented in 2 Days (`CalendarWeekCell`, used by that tab). TC-DAY-006, 007, and 010 below are marked 🚫 accordingly — flagging this for the team rather than silently marking them ✅.

---

**Requirement:** [`06_meal_planner.md`](../requirements/06_meal_planner.md) — Tab 2, Grid view  
**User stories:** [`meal-planner.md`](../user-stories/meal-planner.md) — US-MP-007 – US-MP-010, US-MP-021  
**Test data:** `plannerSeeds` from test-data.json (8 assignments)

---

### TC-DAY-001: Grid view shows 7 day columns × 4 meal-slot rows
**AC:** US-MP-007 — day × meal-slot matrix  
**Priority:** High

**Steps:**
1. Click the **Grid view** tab in Planner.

**Expected result:**
- 7 day columns visible (Mon–Sun of selected week), each with day name and date in its header
- 4 meal-slot rows visible: Breakfast, Lunch, Dinner, Snacks

**Status:** ✅

---

### TC-DAY-002: Each day/slot cell shows seeded items
**AC:** US-MP-007 — items listed per day/slot cell  
**Priority:** High

**Steps:**
1. Open Grid view.
2. Inspect the Monday column.

**Expected result:**
- Monday × Breakfast cell: Berry overnight oats (1 serving)
- Monday × Lunch cell: Chicken quinoa bowl (1 serving)

**Status:** ✅

---

### TC-DAY-003: Day column header shows calorie ring and kcal total
**AC:** US-MP-007 — compact colour-coded calorie ring + day total kcal  
**Priority:** High

**Preconditions:** Monday has Berry overnight oats (Breakfast, 385 kcal) + Chicken quinoa bowl (Lunch, 450 kcal)

**Steps:**
1. View the Monday column header in Grid view.

**Expected result:**
- Header shows a compact calorie ring (colour-coded: green within the user's target corridor, amber below, red above) plus the day's total kcal figure: **835**
- Ring is absent/neutral for day columns with no assignments

**Status:** ✅

---

### TC-DAY-004: Add item to a slot cell in Grid view
**AC:** US-MP-008 — inline search add; also appears in Week summary  
**Priority:** High

**Steps:**
1. In Grid view, select the **Thursday × Dinner** cell (no seed assignments).
2. Click **"+ Add"**.
3. Type `soup` — select **Broccoli cheddar soup** (r-007).

**Expected result:**
- Broccoli cheddar soup appears in the Thursday × Dinner cell
- Week summary shows Broccoli cheddar soup in the Dinner row with `1` in the Thursday cell
- Thursday's header kcal total updates: +220 kcal

**Status:** ✅

---

### TC-DAY-005: Remove item from a slot cell
**AC:** US-MP-008 — remove button deletes the assignment  
**Priority:** High

**Steps:**
1. In Grid view, click **×** on **Lentil tomato soup** in the Tuesday × Dinner cell.

**Expected result:**
- Lentil tomato soup removed from the Tuesday × Dinner cell
- Week summary Tuesday Dinner cell clears
- If Lentil tomato soup has no other assignments, its row may auto-remove from the summary (or remain with empty cells)

**Status:** ✅

---

### TC-DAY-006: Increase servings with + button
**AC:** US-MP-009 — + increases servings by 0.5 per tap  
**Priority:** Medium

**Preconditions:** Turkey meatballs in Sunday × Dinner at 2 servings

**Steps:**
1. In Grid view, look for a **+** control on Turkey meatballs in the Sunday × Dinner cell.

**Expected result (per spec):**
- Servings change from 2 to 2.5; Sunday's header kcal total increases by 145 (0.5 × 290); Week summary Sunday Dinner cell shows 2.5

**Actual (per code inspection):** Grid view's slot cell (`GridSlotCell`) renders no +/− controls at all — only remove (×). There is nothing to click.

**Status:** 🚫 (not implemented — see file-level note above)

---

### TC-DAY-007: Decrease servings with − button — minimum is 0.5
**AC:** US-MP-009 — − decreases by 0.5; minimum 0.5; item not auto-removed  
**Priority:** Medium

**Preconditions:** Turkey meatballs in Sunday × Dinner at 2 servings

**Steps:**
1. In Grid view, look for a **−** control on Turkey meatballs in the Sunday × Dinner cell.

**Expected result (per spec):** Three taps take servings 2.0 → 0.5; a fourth tap holds at 0.5; item is not auto-removed.

**Actual (per code inspection):** No +/− controls are rendered in Grid view's slot cell. To adjust servings today, the user must switch to 2 Days, where the control exists.

**Status:** 🚫 (not implemented — see file-level note above)

---

### TC-DAY-008: Drag item to a different meal slot on the same day column
**AC:** US-MP-010 — drag within a day column reassigns meal slot  
**Priority:** Low

**Steps:**
1. In Grid view, drag **Berry overnight oats** from the Monday × Breakfast cell onto the Monday × Lunch cell.

**Expected result:**
- Berry overnight oats appears in Monday × Lunch
- Monday × Breakfast cell is cleared of Berry overnight oats
- Week summary row for Berry overnight oats updates: Monday column moves from the Breakfast row to the Lunch row

**Status:** ✅

---

### TC-DAY-009: Drag item to a different day column (same meal slot)
**AC:** US-MP-010 — drag across day columns changes day  
**Priority:** Low

**Steps:**
1. In Grid view, drag **Greek salad** from the Friday × Lunch cell onto the Saturday × Lunch cell.

**Expected result:**
- Greek salad appears in Saturday × Lunch
- Friday × Lunch cleared
- Week summary: Friday cell clears; Saturday cell shows the assignment

**Status:** ✅

---

### TC-DAY-010: Log individual item from Grid view
**AC:** US-MP-021 — per-item "+ Log" action in Grid view creates a single tracking entry  
**Priority:** High

**Preconditions:** Monday × Breakfast shows Berry overnight oats, 1 serving

**Steps:**
1. In Grid view, locate **Berry overnight oats** in the Monday × Breakfast cell.
2. Look for a **"+ Log"** per-item action on that item.

**Expected result (per spec):** A Meal tracking entry is created for Berry overnight oats, 1 serving, Monday, Breakfast; no other Monday items are logged; no planner assignments are altered; triggering again adds to the existing entry rather than duplicating it.

**Actual (per code inspection):** Grid view's slot cell (`GridSlotCell`) is never given an `onLog` handler, so no "+ Log" control renders there. The per-item log action **is** implemented in 2 Days (see [`tc-cal.md`](tc-cal.md) TC-CAL-023).

**Status:** 🚫 (not implemented in Grid view — see file-level note above)
