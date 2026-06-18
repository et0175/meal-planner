# Test Cases — TC-DAY: Meal Planner — Calendar: Per-slot Day Editing

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

> **Note:** The Day cards tab has been removed from the Planner. The per-slot, per-day editing experience (formerly "Day cards") now lives in the Calendar tab's **Week**, **Day**, and **4 Days** sub-views. These tests have been updated to reference the Calendar tab; statuses marked ❓ require re-testing in the new Calendar context.

---

**Requirement:** [`06_meal_planner.md`](../requirements/06_meal_planner.md) — Tab 2, Calendar  
**User stories:** [`meal-planner.md`](../user-stories/meal-planner.md) — US-MP-007 – US-MP-010, US-MP-017, US-MP-021  
**Test data:** `plannerSeeds` from test-data.json (8 assignments)

---

### TC-DAY-001: Calendar Week sub-view shows 7 day columns with per-slot layout
**AC:** US-MP-007 — one per-slot column per day  
**Priority:** High

**Steps:**
1. Click **Calendar** tab in Planner, then click **Week** sub-view.

**Expected result:**
- 7 day columns visible (Mon–Sun of selected week)
- Each column shows day name and date
- Each column is divided into four meal slots: Breakfast, Lunch, Dinner, Snacks

**Status:** ✅

---

### TC-DAY-002: Each day column has four meal slots with seeded items
**AC:** US-MP-007 — Breakfast, Lunch, Dinner, Snacks per column  
**Priority:** High

**Steps:**
1. Open Calendar > Week sub-view.
2. Inspect the Monday column.

**Expected result:**
- 4 slot sections: Breakfast, Lunch, Dinner, Snacks
- Monday Breakfast: Berry overnight oats (1 serving)
- Monday Lunch: Chicken quinoa bowl (1 serving)

**Status:** ✅

---

### TC-DAY-003: Day nutrition strip shows correct totals
**AC:** US-MP-007 — aggregated nutrition strip per day  
**Priority:** High

**Preconditions:** Monday has Berry overnight oats (Breakfast) + Chicken quinoa bowl (Lunch)

**Steps:**
1. View Monday column in Calendar > Week sub-view.

**Expected result:**
- Nutrition strip shows summed values:
  - kcal: 385 + 450 = **835**
  - protein: 15 + 38 = **53 g**
  - fat: 8 + 12 = **20 g**
  - carbs: 65 + 42 = **107 g**

**Status:** ✅

---

### TC-DAY-004: Add item to a slot via Calendar Day view
**AC:** US-MP-008 — inline search add; also appears in Week summary  
**Priority:** High

**Steps:**
1. In Calendar > Day sub-view (or Week sub-view), select **Thursday** (no seed assignments).
2. Click **"+ Add"** in the Dinner slot.
3. Type `soup` — select **Broccoli cheddar soup** (r-007).
4. Confirm.

**Expected result:**
- Broccoli cheddar soup appears in Thursday Dinner slot
- Week summary shows Broccoli cheddar soup in the Dinner row with `1` in the Thursday cell
- Thursday nutrition strip updates: +220 kcal

**Status:** ✅

---

### TC-DAY-005: Remove item from a slot
**AC:** US-MP-008 — remove button deletes the assignment  
**Priority:** High

**Steps:**
1. In Calendar (Week or Day sub-view), click **×** on **Lentil tomato soup** in Tuesday Dinner.

**Expected result:**
- Lentil tomato soup removed from Tuesday Dinner
- Week summary Tuesday Dinner cell clears
- If Lentil tomato soup has no other assignments, row may auto-remove from summary (or remain with empty cells)

**Status:** ✅

---

### TC-DAY-006: Increase servings with + button
**AC:** US-MP-009 — + increases servings by 0.5 per tap  
**Priority:** Medium

**Preconditions:** **Turkey meatballs** in Sunday Dinner at 2 servings

**Steps:**
1. In Calendar (Week or Day sub-view), click **+** on Turkey meatballs in Sunday Dinner.

**Expected result:**
- Servings change from 2 to 2.5
- Sunday nutrition strip kcal increases by 145 (0.5 × 290)
- Week summary Sunday Dinner cell shows 2.5

**Status:** ✅

---

### TC-DAY-007: Decrease servings with − button — minimum is 0.5
**AC:** US-MP-009 — − decreases by 0.5; minimum 0.5; item not auto-removed  
**Priority:** Medium

**Preconditions:** Turkey meatballs in Sunday Dinner at 2 servings

**Steps:**
1. In Calendar (Week or Day sub-view), click **−** three times (2.0 → 1.5 → 1.0 → 0.5).
2. Click **−** a fourth time when at 0.5.

**Expected result:**
- After 3 clicks: servings show 0.5
- 4th click: servings remain at 0.5 (does not go below 0.5; item not removed)
- To remove the item, the × button must be used

**Status:** ✅

---

### TC-DAY-008: Drag item to a different meal slot on the same day column
**AC:** US-MP-010 — drag within a day column reassigns meal slot  
**Priority:** Low

**Steps:**
1. In Calendar > Week or Day sub-view, drag **Berry overnight oats** from Monday Breakfast to Monday Lunch.

**Expected result:**
- Berry overnight oats appears in Monday Lunch
- Monday Breakfast slot is cleared of Berry overnight oats
- Week summary row for Berry overnight oats updates: Monday column moves from Breakfast slot to Lunch slot

**Status:** 🚫

---

### TC-DAY-009: Drag item to a different day column
**AC:** US-MP-010 — drag across day columns changes day  
**Priority:** Low

**Steps:**
1. In Calendar > Week or 4 Days sub-view, drag **Greek salad** from Friday Lunch to Saturday Lunch.

**Expected result:**
- Greek salad in Saturday Lunch
- Friday Lunch cleared
- Week summary: Friday cell clears; Saturday cell shows the assignment

**Status:** 🚫

---

### TC-DAY-010: Log individual item from Calendar day view
**AC:** US-MP-021 — per-item "Log" action in Calendar creates a single tracking entry  
**Priority:** High

**Preconditions:** Monday shows Berry overnight oats 1 serving in Breakfast

**Steps:**
1. In Calendar (Week, Day, or 4 Days sub-view), locate **Berry overnight oats** in Monday Breakfast.
2. Click the **"+ Log"** per-item action on that row.
3. Navigate to **Personal cabinet > Meal tracking** tab.
4. Inspect Monday's entries.

**Expected result:**
- A Meal tracking entry is created for Berry overnight oats, 1 serving, Monday, Breakfast
- No other Monday items (Chicken quinoa bowl, etc.) are logged
- No planner assignments are altered
- If triggered again, the entry adds to existing (2 servings total), not duplicate

**Status:** ✅
