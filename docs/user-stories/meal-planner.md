# User Stories: Meal Planner

Requirements: [06_meal_planner.md](../requirements/06_meal_planner.md)

---

## US-MP-001 Navigate between weeks

**As a** user planning meals  
**I want** to move forward and backward through calendar weeks and jump to the current week  
**So that** I can plan ahead or review past weeks.

**Acceptance criteria**

- [ ] Planner defaults to the current calendar week (Monday–Sunday).
- [ ] "Prev" and "Next" buttons shift the week by 7 days.
- [ ] "This week" button returns to the current calendar week regardless of where the user has navigated.
- [ ] The displayed week label updates to reflect the selected range.

---

## US-MP-002 Switch between planner views

**As a** user  
**I want** to switch between the planner's four views  
**So that** I can edit, browse, or review my plan in the format that suits the task.

**Acceptance criteria**

- [ ] Four tabs are visible as a single row of pills: **Week summary**, **Grid view**, **2 Days**, and **Month**. There is no separate "Calendar" wrapper tab.
- [ ] Selecting a tab shows its content and hides the others.
- [ ] All four tabs reflect the same selected week and the same underlying assignments.
- [ ] An assignment created or modified in Week summary, Grid view, or 2 Days is immediately visible in the other two — no page refresh required. Month reflects the same data but does not support editing.

---

## US-MP-003 Build a weekly meal plan in the summary grid

**As a** user  
**I want** to fill in a spreadsheet-style grid with items and servings per day per meal slot  
**So that** I can see and edit my entire week at a glance.

**Acceptance criteria**

- [ ] The grid is grouped into four meal slots: Breakfast, Lunch, Dinner, Snacks.
- [ ] Each row has a product/recipe search input and seven day columns (Mon–Sun).
- [ ] Entering a number in a day cell creates or updates that assignment.
- [ ] Clearing or zeroing a cell removes the assignment.

---

## US-MP-004 Add and remove items from the weekly summary

**As a** user  
**I want** to add new rows to any meal slot and remove rows I no longer need  
**So that** my summary reflects the current plan.

**Acceptance criteria**

- [ ] Each meal slot has an "Add item" button that appends a blank row.
- [ ] Removing a row removes all assignments for that item+meal-slot combination; other slots for the same item are unaffected.

---

## US-MP-005 Select unit per row via a dedicated unit column

**As a** user who thinks in weight rather than servings  
**I want** a dedicated unit selector column in the Week summary grid to switch each row between servings mode and grams mode  
**So that** I can enter quantities in the unit I actually measure.

**Acceptance criteria**

- [ ] A **unit selector column** is visible in the Week summary grid for every row.
- [ ] The column shows the active unit (e.g. "srv" or "g") and is clickable to toggle between servings mode and grams mode.
- [ ] Grams mode is available only for items that have a gram weight per serving defined.
- [ ] Switching modes converts existing values without changing the underlying serving count.
- [ ] In grams mode, a secondary label shows the equivalent serving count, and vice versa.

---

## US-MP-006 Weekly-selected items populate the summary automatically

**As a** user  
**I want** products and recipes I mark "This week" to appear in the planner summary  
**So that** I do not have to add them manually.

**Acceptance criteria**

- [ ] Marking an item "This week" in All products or Recipes adds it to the Lunch slot of the Week summary.
- [ ] Items are not duplicated if already present in that slot.

---

## US-MP-007 View and manage meals per day in Grid view

**As a** user  
**I want** each day to show its planned meals divided by Breakfast, Lunch, Dinner, and Snacks  
**So that** I can see and adjust what I am eating each day.

**Acceptance criteria**

- [ ] Grid view shows a day × meal-slot matrix: seven day columns (Mon–Sun), each meal slot (Breakfast, Lunch, Dinner, Snacks) as a row.
- [ ] Each meal slot row lists the items assigned on that day, with kcal and servings.
- [ ] Each day column header shows a compact colour-coded calorie ring (green within the target corridor, amber below, red above) and the day's total kcal, when there is at least one item planned that day.

---

## US-MP-008 Add and remove meals from Grid view slot cells

**As a** user  
**I want** to add items directly to a specific day/meal-slot cell in Grid view and remove items I no longer want  
**So that** I can fine-tune each day without going back to the summary grid.

**Acceptance criteria**

- [ ] Each day/meal-slot cell in Grid view has an "+ Add" button that opens an inline search input.
- [ ] Selecting an item creates an assignment for that day+meal and adds the item to the weekly summary if absent.
- [ ] Each item has a remove button; clicking it deletes the assignment.

---

## US-MP-009 Adjust servings in Grid view and 2 Days

**As a** user  
**I want** to increase or decrease the number of servings for an item in Grid view or 2 Days  
**So that** portion sizes match what I will actually eat.

**Acceptance criteria**

- [ ] Each item has + and − controls.
- [ ] The − button decreases servings by 0.5 per tap, with a minimum of 0.5 (the item is never auto-removed by the − button alone).
- [ ] To remove an item entirely, the user uses the × remove button (see US-MP-008).
- [ ] The day's kcal total updates immediately after each change.

---

## US-MP-010 Drag items between meal slots and days in Grid view

**As a** user  
**I want** to drag a planned item from one meal slot or day to another in Grid view  
**So that** I can rebalance my week quickly.

**Acceptance criteria**

- [ ] Items are draggable; a visual cue (opacity change) indicates the dragged item.
- [ ] Dropping on a different meal slot of the same day column reassigns the item to that meal slot.
- [ ] Dropping on a meal slot of a different day column changes both the day and the meal slot.
- [ ] The source column updates (item removed from old slot) and the target updates (item added to new slot).

---

## US-MP-011 View the week at a glance in Grid view

**As a** user  
**I want** a compact grid showing all planned items across the week  
**So that** I can quickly sense-check the week.

**Acceptance criteria**

- [ ] Grid view shows seven day columns (Mon–Sun).
- [ ] Each column shows items grouped by meal slot with serving count and kcal.
- [ ] Today's column is visually highlighted.
- [ ] Content reflects the same assignments as the Week summary tab.

---

## US-MP-012 Browse the full month in the Month tab

**As a** user  
**I want** a full-month grid available as its own tab  
**So that** I can zoom out to see how my meals are distributed across the month.

**Acceptance criteria**

- [ ] **Month** is one of the four top-level planner tabs (Week summary, Grid view, 2 Days, Month), not a toggle nested inside another tab.
- [ ] Month shows a 6-week grid (42 cells, Mon–Sun columns) for the month containing the currently selected week.
- [ ] Days outside the current calendar month are visually de-emphasised.
- [ ] A **Prev / Next month** navigation pair appears in the Month tab's header, separate from the week navigation above the tab row.
- [ ] Switching to another tab and back to Month preserves the previously selected month offset within the session.

> See also US-MP-024 for Month's read-only behaviour (no add/remove/drag/logging).

---

## US-MP-013 Add and remove meals in 2 Days

**As a** user  
**I want** to add items to a day and remove them directly in the 2 Days view  
**So that** I can edit my plan without switching to the Week summary.

**Acceptance criteria**

- [ ] Each of the two visible day columns has a "+ Add" button per meal slot that opens an inline search + meal-slot picker.
- [ ] Confirming the add creates an assignment for that day and slot and registers the item in the Week summary.
- [ ] Each item has an × button; clicking it removes that assignment.

---

## US-MP-014 Drag items between the two visible days in 2 Days

**As a** user  
**I want** to drag planned items from one visible day column to the other in 2 Days  
**So that** I can move meals to different days without re-entering them.

**Acceptance criteria**

- [ ] Items in the 2 Days day columns are draggable.
- [ ] Dropping on the other visible day column moves the assignment to that day while keeping the original meal slot.
- [ ] The source and target columns update immediately.

---

## 🚫 US-MP-015 See active diet label in the planner header — Deferred to post-MVP1

> **Decision (OQ-011):** Depends on active-diet selection in Personal cabinet (`personal-cabinet.md` US-PC-005), which is deferred along with the Dietary Analyser module. Kept for historical/planning reference.

**As a** user who has set a diet preference in their profile  
**I want** to see my active diet displayed in the planner header  
**So that** I can plan meals with my dietary context in view without switching to the Personal cabinet.

**Acceptance criteria**

- [ ] ~~When a diet is selected in Personal cabinet, its name appears as a label in the Meal planner header.~~ 🚫 Deferred (OQ-011).
- [ ] ~~The label is informational only — the planner does not filter or enforce diet rules automatically.~~ 🚫 Deferred (OQ-011).
- [ ] ~~If no diet is selected in the profile, no label is shown.~~ 🚫 Deferred (OQ-011).

---

## US-MP-016 Log planned meals to Meal tracking

**As a** user who wants to record what I ate without re-entering data  
**I want** to log a single day or an entire week from the planner in one action  
**So that** my Meal tracking entries are pre-filled from my plan.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Log from plan

**Acceptance criteria**

- [ ] A "Log this day" action is available in the Meal planner for the currently selected day; triggering it creates Meal tracking entries for all assignments on that day.
- [ ] A "Log this week" action is available; triggering it creates Meal tracking entries for all assignments across the selected week (Mon–Sun).
- [ ] Created entries appear in the Meal Tracking tab of the Personal cabinet with the item name, serving count, and meal slot pre-filled.
- [ ] Created entries are editable in the Meal tracking section after creation.
- [ ] If a Meal tracking entry already exists for the same day and item, the action adds to it rather than duplicating or silently overwriting.
- [ ] Triggering "Log this day" or "Log this week" does not alter any planner assignments.

---

## US-MP-017 Navigate focused day pairs in 2 Days

**As a** user who wants a focused view of a couple of days  
**I want** to scroll through the week two days at a time  
**So that** I can see and edit meals in more detail than the full-week grid allows.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Tab 3, 2 Days

> **Note:** The earlier "Day" and "4 Days" sub-views described in prior revisions of this story were never built and have been removed from the spec. 2 Days is the one surviving focused view, and its behaviour is unchanged from before it became a top-level tab.

**Acceptance criteria**

- [ ] A date scroller lets the user pick which pair of consecutive days is shown.
- [ ] The 2 visible day columns are each divided into four meal slots: Breakfast, Lunch, Dinner, Snacks.
- [ ] Each column shows a per-day calorie ring and macro breakdown at the top, plus an item list with serving count, kcal, and +/− controls per item.
- [ ] Add, remove, and serving-count adjustment are supported in both visible day columns.
- [ ] Drag-and-drop between the two visible day columns is supported.

---

## US-MP-018 Grid view / 2 Days plan summary and drag from summary

**As a** user planning in Grid view or 2 Days  
**I want** to see a summary of all planned items above the day grid, organised by meal slot, and drag items from that summary to a day  
**So that** I can quickly assign planned items to specific days without switching tabs.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Plan summary (Grid view and 2 Days only)

**Acceptance criteria**

- [ ] A collapsible plan summary panel is shown at the top of **Grid view and 2 Days only** (above the day grid), **organised as a gallery grouped by meal slots** (Breakfast, Lunch, Dinner, Snacks columns). Each slot group contains item cards showing item name, total servings, and kcal.
- [ ] The plan summary panel is **not shown in Month**, which is read-only.
- [ ] The user can drag an item from the summary panel onto a day cell to create an assignment for that day in a chosen meal slot.
- [ ] After dragging from the summary, the item remains in the summary (it is still part of the plan; only a new day assignment is created).
- [ ] Dragging an item from one day cell to another moves the assignment: the item disappears from the source day and appears on the target day in the same meal slot.
- [ ] The plan summary updates immediately when assignments are added or removed.

---

## US-MP-019 Nutrition progress and target-reaching summary in planner

**As a** user tracking my nutritional goals  
**I want** to see the percentage of my target corridor consumed for each planned day, and a weekly summary, with a per-macro target-reaching display in Grid view and 2 Days  
**So that** I can plan ahead to stay on target across all macros.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Nutrition progress

**Acceptance criteria**

- [ ] In Grid view and 2 Days, each day column shows the day's planned kcal as a percentage of the user's calorie target corridor.
- [ ] In Grid view and 2 Days, each day column additionally shows a **target-reaching summary** (same format as the Personal cabinet Meal tracking display): kcal, protein, fat, and carbs planned vs. target corridor, each with a colour-coded indicator (green = within corridor, amber = approaching limit, red = above).
- [ ] In Week summary, a summary strip shows average % of target for calories, protein, fat, and carbs across the planned week.
- [ ] **Month does not show a nutrition or target-reaching summary.** It is a read-only overview of which items are planned each day; the user switches to Grid view or 2 Days to see daily nutrition targets.
- [ ] Percentage bars or labels use a visual indicator (e.g. green for within corridor, amber for approaching, red for above).
- [ ] If no calorie target is set in the profile, the percentage strip and target-reaching summary are not shown. (Note: this refers to the calorie target/macro split from `personal-cabinet.md` US-PC-005, not diet selection, which is deferred — OQ-011.)

---

## US-MP-020 Search results sorted by recently used, then user-owned, then alphabetical

**As a** user adding items to the planner  
**I want** the item search suggestions to show recently used items first, then items I own, then everything else alphabetically  
**So that** commonly planned and personal items are always at the top without scrolling.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Search sorting

**Acceptance criteria**

- [ ] In all item search inputs within the planner (Week summary, Grid view, 2 Days), suggestions are sorted: recently planned or recently logged items first, then items owned by the current user (isUserAdded), then all others alphabetically.
- [ ] "Recently used" is defined as items that appear in the current or previous week's assignments, or in recent tracking log entries.
- [ ] Items not recently used are shown after the recently-used group, user-owned next, then alphabetically.
- [ ] The sort order is applied in real time as the user types.

---

## US-MP-021 Log an individual planned item to Meal tracking

**As a** user reviewing my meals in the planner  
**I want** to log a single item directly from Grid view or 2 Days without logging the entire day  
**So that** I can mark only what I actually ate, one item at a time.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Log from plan

**Acceptance criteria**

- [ ] Each item in **Grid view and 2 Days** shows a **"+ Log"** per-item action. Month is read-only and has no per-item log action.
- [ ] Triggering the per-item log action creates a single Meal tracking entry for that item, its current serving count, and its meal slot on that day.
- [ ] If a tracking entry already exists for the same day and item, the action adds to it (does not duplicate).
- [ ] The bulk "Log this day" and "Log this week" actions remain available and are unaffected.
- [ ] The per-item log action does not alter any planner assignments.

---

## US-MP-022 Download meal plan as PDF

**As a** user who wants to share or print my meal plan  
**I want** to download the current week's plan as a PDF  
**So that** I can have an offline or printed copy of my schedule.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — PDF export

**Acceptance criteria**

- [ ] A **"Download PDF"** action is available in the Meal planner (accessible from Week summary or the planner header).
- [ ] Triggering it downloads a PDF file containing the full Week summary grid: item names, meal slots, day columns (Mon–Sun), serving counts, and nutrition totals.
- [ ] The PDF includes the selected week date range in the header.
- [ ] If the plan is empty, the PDF still downloads with the week header and empty slots (no error).

---

## US-MP-023 Add item directly to plan summary panel

**As a** user planning in Grid view or 2 Days  
**I want** to add an item to a specific meal slot in the plan summary panel without switching views  
**So that** I can build my plan quickly from within the current tab itself.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Plan summary — Add to summary

**Acceptance criteria**

- [ ] Each meal slot column in the plan summary panel has an **add (+)** button visible in the slot header.
- [ ] Clicking the + button opens an inline search input within that slot column.
- [ ] Typing in the search input filters all items (products and recipes) by name in real time.
- [ ] Selecting an item from the search results adds it as an assignment on the first visible day in that slot.
- [ ] The plan summary updates immediately to show the newly added item.
- [ ] The search input closes after an item is selected; clicking + again re-opens it.

---

## US-MP-024 Month view is read-only

**As a** user browsing my plan across a full month  
**I want** the Month tab to be a pure overview  
**So that** I can scan what's planned without risking accidental edits while zoomed out.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Tab 4, Month

**Acceptance criteria**

- [ ] Each day cell in Month shows up to 2 item names for that day, plus a "+N more" overflow label when more than 2 items are planned. No kcal figures are shown per item.
- [ ] Month has no add, remove, or drag-and-drop capability on any cell.
- [ ] The plan summary panel is not shown in Month.
- [ ] Month does not show a nutrition or target-reaching summary for any day.
- [ ] No per-item "+ Log" action is shown in Month.
- [ ] To edit a day, the user must switch to Grid view or 2 Days; Month provides no in-place editing path.

---

## US-MP-025 Reorder planner tabs by dragging

**As a** user with a preferred order for the planner views  
**I want** to drag a tab pill onto another to swap their positions  
**So that** I can put the view I use most first, for the current session.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Four views (tabs) — Reorder tabs

**Acceptance criteria**

- [ ] The default tab order is Week summary, Grid view, 2 Days, Month.
- [ ] Dragging one tab pill onto another swaps the two tabs' positions in the row; other tabs keep their relative order.
- [ ] The currently active tab remains active (its content stays shown) after a reorder, even if its position in the row changed.
- [ ] The reordered tab sequence persists only for the current session — reloading the page resets the tab order to the default.
