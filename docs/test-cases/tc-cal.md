# Test Cases — TC-CAL: Meal Planner — Grid View, 2 Days, and Month

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

> **Note (2026-08-19):** The Planner's old "Calendar" wrapper tab is gone. Its former Week sub-view is now the top-level **Grid view** tab; its former Month sub-view is now the top-level **Month** tab (and is now explicitly read-only); "2 Days" is now a top-level tab in its own right (its behaviour is unchanged from before). The "Day" and "4 Days" sub-views never existed in the actual implementation and have been dropped from the spec — TC-CAL-014, 015, and 016 below have been removed or retargeted accordingly. This file now covers Grid view, 2 Days, and Month; Week summary and tab-switching/reordering live in [`tc-pln.md`](tc-pln.md), and Grid view's per-slot editing mechanics live in [`tc-day.md`](tc-day.md).

---

**Requirement:** [`06_meal_planner.md`](../requirements/06_meal_planner.md) — Tabs 2–4 (Grid view, 2 Days, Month)  
**User stories:** [`meal-planner.md`](../user-stories/meal-planner.md) — US-MP-007 – US-MP-011, US-MP-013, US-MP-014, US-MP-017 – US-MP-025  
**Test data:** `plannerSeeds` from test-data.json (8 assignments)

---

## Grid view

### TC-CAL-001: Grid view tab is accessible
**AC:** US-MP-011 — Grid view tab renders  
**Priority:** High

**Steps:**
1. Click the **Grid view** tab in Planner.

**Expected result:**
- Grid view renders as a day × meal-slot matrix: 7 day columns, 4 meal-slot rows
- No "Calendar" wrapper or Week/Month sub-view toggle is present — Grid view is reached directly as a top-level tab

**Status:** ✅

---

### TC-CAL-002: Today's column is highlighted
**AC:** US-MP-011 — today's column visually highlighted  
**Priority:** Medium

**Steps:**
1. Open Grid view.

**Expected result:**
- Today's day column has a teal border/ring distinguishing it from other columns
- Other columns do not have this highlight

**Status:** ✅

---

### TC-CAL-003: Seeded items appear in correct day/slot cells
**AC:** US-MP-011 — Grid view reflects same assignments as other tabs  
**Priority:** High

**Steps:**
1. Open Grid view (current week).

**Expected result:**
- Monday: Berry overnight oats (Breakfast row), Chicken quinoa bowl (Lunch row)
- Tuesday: Lentil tomato soup (Dinner row)
- Wednesday: Spinach omelette (Breakfast row), Chickpea curry (Lunch row, 2 servings)
- Thursday: empty
- Friday: Avocado toast (Breakfast row), Greek salad (Lunch row)
- Saturday: empty
- Sunday: Turkey meatballs (Dinner row, 2 servings)

**Status:** ✅

---

### TC-CAL-004: Each grid item shows name and servings
**AC:** US-MP-011 — items show name, serving count, kcal contribution  
**Priority:** Medium

**Steps:**
1. Inspect the Monday × Breakfast and Monday × Lunch cells.

**Expected result:**
- Berry overnight oats shows: name, servings ("1"), kcal contribution
- Chicken quinoa bowl shows: name, servings ("1"), kcal contribution
- Note: unlike the old per-item calendar chip, no separate meal-slot text label is shown per item in Grid view — the row heading (e.g. "Breakfast") already identifies the slot, so per-item slot labels would be redundant

**Status:** ✅

---

### TC-CAL-005: Add item via a Grid view cell
**AC:** US-MP-008 — add creates assignment and registers in weekly summary  
**Priority:** High

**Steps:**
1. Click **"+ Add"** in the Thursday × Snacks cell.
2. Type `pudding` — select **Chia pudding** (r-012).

**Expected result:**
- Chia pudding appears in the Thursday × Snacks cell
- Week summary > Snacks slot shows Chia pudding with `1` in the Thursday column
- Thursday's header kcal total updates: +210 kcal

**Status:** ✅

---

### TC-CAL-006: Add with no item selected — nothing added
**AC:** US-MP-008 — empty search should not create an assignment  
**Priority:** Medium

**Steps:**
1. Click **"+ Add"** in the Saturday × Lunch cell.
2. Leave the search field empty, then click away (blur) without selecting an item.

**Expected result:**
- Nothing added to Saturday
- No empty row appears in the weekly summary

**Status:** ✅

---

### TC-CAL-007: Remove item via × in Grid view
**AC:** US-MP-008 — hovering reveals × button; click removes assignment  
**Priority:** High

**Steps:**
1. Hover over **Lentil tomato soup** in the Tuesday × Dinner cell.
2. Click the **×** button.

**Expected result:**
- Lentil tomato soup removed from the Tuesday × Dinner cell
- Week summary Tuesday Dinner cell clears

**Status:** ✅

---

### TC-CAL-008: Drag between day cells preserves meal slot
**AC:** US-MP-010 — dragging to a cell in the same slot row keeps the meal slot; only the day changes  
**Priority:** Low

**Steps:**
1. Drag **Avocado toast** from the Friday × Breakfast cell onto the Saturday × Breakfast cell (same row, different column).

**Expected result:**
- Avocado toast appears in Saturday × Breakfast
- Friday × Breakfast no longer shows Avocado toast
- Week summary: Friday Breakfast cell clears; Saturday Breakfast cell shows the assignment

**Status:** ✅

---

### TC-CAL-009: Grid view changes reflect in Week summary
**AC:** US-MP-011 — Grid view and Week summary share the same data  
**Priority:** High

**Steps:**
1. Add Chia pudding to Thursday via Grid view (TC-CAL-005).
2. Switch to **Week summary** tab.

**Expected result:**
- Week summary > Snacks row shows Chia pudding in the Thursday column

**Status:** ✅

---

### TC-CAL-017: Plan summary panel is a gallery grouped by meal slots
**AC:** US-MP-018 — plan summary shows a gallery with one column per meal slot  
**Priority:** High

**Steps:**
1. Open Grid view (current week).

**Expected result:**
- A collapsible plan summary panel appears above the day grid
- Items are organised as a gallery with four columns: Breakfast, Lunch, Dinner, Snacks
- Each column contains item cards for planned items in that slot
- Example: Breakfast column shows Berry overnight oats (1 serving, 385 kcal); Lunch column shows Chicken quinoa bowl (1 serving, 450 kcal)
- All 8 seeded items appear in their respective slot columns

**Status:** ✅

---

### TC-CAL-018: Drag item from summary panel to a day cell
**AC:** US-MP-018 — drag from summary creates assignment; item remains in summary  
**Priority:** Medium

**Steps:**
1. In Grid view, locate **Greek salad** in the plan summary (currently Friday Lunch).
2. Drag **Greek salad** from the summary panel onto the **Thursday × Dinner** cell.

**Expected result:**
- A new assignment is created: Thursday Dinner — Greek salad
- Greek salad **still appears** in the plan summary (it was already planned; this adds a new day)
- Thursday × Dinner cell in the grid now shows Greek salad
- Week summary: Thursday Dinner column shows Greek salad

**Status:** ✅

---

### TC-CAL-019: Drag item from one day cell to another in Grid view
**AC:** US-MP-010 — drag between day cells moves assignment (disappears from source)  
**Priority:** Medium

**Steps:**
1. In Grid view, drag **Avocado toast** from the Friday × Breakfast cell to the Saturday × Breakfast cell.

**Expected result:**
- Avocado toast **disappears** from Friday
- Avocado toast appears in Saturday with the same meal slot (Breakfast)
- Week summary: Friday Breakfast clears; Saturday Breakfast shows Avocado toast

**Status:** ✅

---

### TC-CAL-025: Add item to plan summary panel via inline search (Grid view)
**AC:** US-MP-023 — each summary slot has a + button; selecting an item adds it as an assignment on the first visible day  
**Priority:** High

**Preconditions:** Planner Grid view open (current week); plan has at least one existing assignment so the plan summary panel is visible

**Steps:**
1. In the plan summary panel, click the **+** button in the **Breakfast** slot header.
2. Type `yogurt` in the inline search input.
3. Click **Greek yogurt** in the dropdown.
4. Inspect the **Monday × Breakfast** cell.

**Expected result:**
- Clicking + opens an inline search input inside the Breakfast column
- Typing "yogurt" shows matching items (e.g. Greek yogurt 88 kcal)
- After selecting Greek yogurt, the search input closes
- The plan summary Breakfast column now shows Greek yogurt
- Monday × Breakfast cell shows Greek yogurt with 1 serving
- Planner topbar kcal total increases by 88 kcal

**Steps (close without selecting):**
5. Click + in the **Lunch** slot; then click + again to dismiss.

**Expected result:**
- Clicking + a second time dismisses the inline search without adding anything

**Status:** ✅

---

## 2 Days

### TC-CAL-015: 2 Days shows the two visible day columns grouped by meal slot
**AC:** US-MP-017 — 2 Days displays two consecutive day columns, each divided into four meal slots  
**Priority:** High

> Retargeted from a removed "Day sub-view" test (single-day layout). "Day" never existed in the actual implementation; the surviving focused view is 2 Days.

**Steps:**
1. Click the **2 Days** tab in Planner.

**Expected result:**
- Two day columns are shown (Mon and Tue if Monday is the currently selected start day)
- Each column's items are grouped by meal slot (Breakfast, Lunch, Dinner, Snacks)
- Monday items visible (Berry overnight oats — Breakfast, Chicken quinoa bowl — Lunch)
- Each column shows a per-day calorie ring and macro breakdown at the top
- Add, remove, and serving-count (+/−) controls are present on items in both columns

**Status:** ✅

---

### TC-CAL-016: Date scroller navigates the visible day pair in 2 Days
**AC:** US-MP-017 — a date scroller selects which pair of consecutive days is shown  
**Priority:** High

> Retargeted from a removed "4 Days sub-view" test. "4 Days" never existed in the actual implementation; 2 Days' date scroller is the surviving navigation mechanism.

**Steps:**
1. Open the **2 Days** tab.
2. In the date scroller, click on **Wednesday**.

**Expected result:**
- The two visible columns become **Wednesday and Thursday**
- Wednesday column shows the correct seeded assignments (Spinach omelette — Breakfast, Chickpea curry — Lunch, 2 servings)
- Thursday column is empty (no seed assignments)
- Drag-and-drop between the two visible columns works (see TC-DAY-008/009 pattern, applied to 2 Days)

**Status:** ✅

---

### TC-CAL-023: Log individual item from 2 Days
**AC:** US-MP-021 — per-item "+ Log" action in 2 Days creates a single tracking entry  
**Priority:** High

**Preconditions:** 2 Days tab open; date scroller set so Monday is one of the two visible columns; Monday shows Chicken quinoa bowl (Mon Lunch seed)

**Steps:**
1. In the date scroller, select **Monday** so it is visible.
2. Locate **Chicken quinoa bowl** in the Monday column.
3. Click the **"+ Log"** per-item action on that item.
4. Navigate to **Personal cabinet > Meal tracking** tab.
5. Inspect Monday's entries.

**Expected result:**
- A Meal tracking entry is created for Chicken quinoa bowl, 1 serving, Monday, Lunch
- Berry overnight oats and other Monday items are **not** logged (per-item only)
- No planner assignments are altered
- If triggered again, the entry adds to existing (not duplicate)
- Note: the equivalent per-item "+ Log" action is **not implemented in Grid view** — see [`tc-day.md`](tc-day.md) TC-DAY-010

**Status:** ✅

---

### TC-CAL-024: 2 Days column shows target-reaching summary (kcal + macros vs. corridor)
**AC:** US-MP-019 — Grid view and 2 Days show per-macro target-reaching summary with colour-coded indicators  
**Priority:** Medium

**Preconditions:** User u-001 has targets: 2000 kcal corridor, protein 30%, fat 35%, carbs 35%; seed data loaded (Monday: Berry overnight oats 385 kcal + Chicken quinoa bowl 450 kcal = 835 kcal total; protein ≈ 42 g, fat ≈ 22 g, carbs ≈ 118 g)

**Steps:**
1. Open Planner > **2 Days** tab; use the date scroller to make Monday visible.
2. Inspect the Monday column's nutrition strip.

**Expected result:**
- Monday column shows a nutrition strip with a calorie ring/macro-ring plus text lines for **kcal**, **protein**, **fat**, and **carbs**
- The kcal figure is colour-coded (green if within corridor, amber if approaching, red if above): 835 kcal shown in green (within the 1850–2150 corridor)
- The summary format matches the Personal cabinet Meal tracking display's colour convention
- Columns with no assignments do not show the strip
- If u-001 has no calorie target set, the strip's colour-coding falls back to neutral (no corridor to compare against)
- Note: Grid view's day-column header shows only the calorie ring + kcal total (no separate protein/fat/carbs text) — see TC-PLN-012. The full textual macro breakdown described in US-MP-019 is fully implemented in 2 Days, and only partially (ring only) in Grid view.

**Status:** ✅ (2 Days) — see TC-PLN-012 for Grid view's partial coverage

---

### TC-CAL-029: Plan summary panel also appears in 2 Days
**AC:** US-MP-018 — plan summary panel shown on Grid view and 2 Days, gallery grouped by meal slot  
**Priority:** Medium

**Steps:**
1. Open the **2 Days** tab (current week, at least one assignment planned).

**Expected result:**
- The same collapsible plan summary panel as Grid view appears above the two day columns
- Items are organised as a gallery with four columns (Breakfast, Lunch, Dinner, Snacks)
- Dragging an item from the summary panel onto a visible day column creates an assignment on the first visible day in that slot (see US-MP-018)

**Status:** ✅

---

## Month

### TC-CAL-010: Switch to Month tab
**AC:** US-MP-012 — Month tab shows a 42-cell grid  
**Priority:** Medium

**Steps:**
1. Click the **Month** tab in Planner.

**Expected result:**
- 42-cell grid displayed (6 rows × 7 columns, Mon–Sun)
- Day-of-week header visible
- Days outside the current month are visually de-emphasised
- Month label shows the current month name

**Status:** ✅

---

### TC-CAL-011: Today highlighted in Month
**AC:** US-MP-012 — today's cell has a teal circle in Month  
**Priority:** Medium

**Steps:**
1. Open the **Month** tab.

**Expected result:**
- Today's date cell has a teal-circled day number

**Status:** ✅

---

### TC-CAL-012: Prev / Next month navigation
**AC:** US-MP-012 — Prev/Next month buttons within the Month tab's own header  
**Priority:** Medium

**Steps:**
1. In the Month tab, click **‹ (Prev month)**.
2. Click **› (Next month)**.

**Expected result:**
- Grid shifts to previous / next month
- Month label updates accordingly
- The week navigation above the tab row (Prev/Next week, "This week") remains unchanged — Month navigation is a separate control

**Status:** ✅

---

### TC-CAL-013: Switching tabs preserves plan data around Month
**AC:** US-MP-012 / data consistency — state is preserved when switching to and from Month  
**Priority:** Medium

> Retargeted: the original test made a change while in Month view, which is no longer possible now that Month is read-only (see TC-CAL-027). The test now verifies data consistency by editing in Grid view instead.

**Steps:**
1. In **Grid view**, add an item to next Thursday (or any empty cell).
2. Switch to the **Month** tab and confirm the new item's day cell shows the item name.
3. Switch back to **Grid view**.

**Expected result:**
- The item added in step 1 is visible in the Month cell for that day (up to the "2 names + N more" display rule)
- After switching back, Grid view still shows the item — no data was lost or altered by visiting Month

**Status:** ✅

---

### TC-CAL-026: Month cells are read-only with 2-name + overflow display
**AC:** US-MP-024 — Month cells show up to 2 item names plus "+N more" overflow, no kcal figures  
**Priority:** High

**Preconditions:** A day in the visible month has 3+ assignments (e.g. add a 3rd item to Monday via Grid view first)

**Steps:**
1. Add a third item to Monday via Grid view so Monday has 3 assignments.
2. Switch to the **Month** tab and inspect the Monday cell.

**Expected result:**
- Monday's cell shows up to 2 item names
- A "+1 more" (or appropriate count) overflow label is shown for the remaining item(s)
- No kcal figures are shown on any item in the Month grid

**Status:** ✅

---

### TC-CAL-027: Month has no add, remove, or drag capability
**AC:** US-MP-024 — Month is read-only: no add, remove, or drag-and-drop  
**Priority:** High

**Steps:**
1. Open the **Month** tab.
2. Look for an "+ Add" control, a remove (×) control, or attempt to drag an item chip within a day cell.

**Expected result:**
- No "+ Add" button is present on any day cell
- No remove control is present on any item name shown in a cell
- Item names in Month cells are not draggable
- A caption near the month navigation indicates this is a read-only overview and directs the user to Grid view or 2 Days to edit a day

**Status:** ✅

---

### TC-CAL-028: Plan summary panel and nutrition summary are absent in Month
**AC:** US-MP-018 / US-MP-019 / US-MP-024 — no plan summary panel and no nutrition/target-reaching summary in Month  
**Priority:** Medium

**Steps:**
1. Open the **Month** tab (with at least one assignment in the visible month so the panel would otherwise have content).

**Expected result:**
- No plan summary panel is shown above or within the Month grid
- No per-day kcal, calorie ring, or target-reaching summary is shown anywhere in the Month grid
- No per-item "+ Log" action is present

**Status:** ✅

---

## Log from plan (planner-wide)

### TC-CAL-020: Log this day from Planner
**AC:** US-MP-016 — "Log this day" creates tracking entries for the selected day  
**Priority:** High

**Steps:**
1. In Planner (any tab), look for a **"Log this day"** action for the currently selected/visible day.
2. Trigger it, then navigate to **Personal cabinet > Meal tracking** and inspect that day's entries.

**Expected result (per spec):** Meal tracking entries are created for all of that day's assignments, pre-filled with item, servings, and meal slot; no planner assignments are altered.

**Actual (per code inspection):** The Planner's top-level controls only expose a **"Log week"** button (wired to `logWeek()` in `page.tsx`). A `logDay()` function and a "Log day" button exist in the codebase (`DayCardsView`), but that component is not mounted by the current `PlannerView` — it is dead code left over from the pre-redesign "Day cards" tab. There is currently no reachable "Log this day" control anywhere in the UI.

**Status:** 🚫 (not implemented/reachable — flagged for the team; was previously marked ✅, which no longer reflects the current UI)

---

### TC-CAL-021: Log this week from Planner
**AC:** US-MP-016 — "Log this week" creates tracking entries for all assignments across Mon–Sun of the selected week  
**Priority:** High

**Preconditions:** Seed data loaded; current week selected; 8 seeded assignments across Mon / Tue / Wed / Fri / Sun

**Steps:**
1. In Planner (any tab), click the **"Log week"** button in the week-navigation row (shown whenever the selected week has at least one assignment).
2. Navigate to Personal cabinet > Meal tracking.
3. Check entries for each day that has a seed assignment.

**Expected result:**
- Meal tracking shows entries for all 8 seeded assignments, grouped by day
- Each entry shows item name, serving count, and meal slot pre-filled
- All entries are editable
- No planner assignments were added, changed, or removed

**Status:** ✅

---

### TC-CAL-022: Log this day — duplicate-prevention (adds to existing entry)
**AC:** US-MP-016 AC#5 — if a tracking entry already exists for the same day and item, the action adds to it rather than duplicating  
**Priority:** Medium

**Steps:**
1. Attempt to trigger "Log this day" for Monday a second time (see TC-CAL-020).

**Expected result (per spec):** Berry overnight oats entry shows 2 servings (original 1 + new 1), not two separate 1-serving entries; no orphaned duplicates.

**Status:** 🚫 (blocked by TC-CAL-020 — "Log this day" is not reachable in the current UI, so duplicate-prevention cannot be exercised; was previously marked ✅)

---

## Removed

### ~~TC-CAL-014: Calendar tab has Day / 4 Days / Week / Month sub-view buttons~~
**Removed (2026-08-19).** The four-way sub-view toggle inside a "Calendar" wrapper tab no longer exists — Week summary, Grid view, 2 Days, and Month are now four flat top-level tabs, and users can drag one tab pill onto another to reorder them. This capability is now covered by [`tc-pln.md`](tc-pln.md) TC-PLN-014 (tab switching) and TC-PLN-017/TC-PLN-018 (tab reordering and its session-only persistence).
