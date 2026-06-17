# Test Cases — TC-CAL: Meal Planner — Calendar

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

**Requirement:** [`06_meal_planner.md`](../requirements/06_meal_planner.md) — Tab 3  
**User stories:** [`meal-planner.md`](../user-stories/meal-planner.md) — US-MP-011 – US-MP-018  
**Test data:** `plannerSeeds` from test-data.json (8 assignments)

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
