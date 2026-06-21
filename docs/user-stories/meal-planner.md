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
**I want** to switch between Week summary and Calendar tabs  
**So that** I can edit, browse, or review my plan in the format that suits the task.

**Acceptance criteria**

- [ ] Two tabs are visible: **Week summary** and **Calendar**.
- [ ] Selecting a tab shows its content and hides the other.
- [ ] Both tabs reflect the same selected week and the same underlying assignments.
- [ ] An assignment created or modified in the Calendar tab is immediately visible in the Week summary tab and vice versa — no page refresh required.

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

## US-MP-007 View and manage meals per day in Calendar sub-views

**As a** user  
**I want** each day to show its planned meals divided by Breakfast, Lunch, Dinner, and Snacks in the Calendar  
**So that** I can see and adjust what I am eating each day.

**Acceptance criteria**

- [ ] Calendar > Week sub-view shows seven day columns, each divided into four meal slots: Breakfast, Lunch, Dinner, Snacks.
- [ ] Each meal slot lists the items assigned on that day, with kcal and servings.
- [ ] Each day column shows an aggregated nutrition strip (kcal, protein, fat, carbs) when there is at least one item.

---

## US-MP-008 Add and remove meals from calendar day slot sections

**As a** user  
**I want** to add items directly to a specific meal slot in a calendar day column and remove items I no longer want  
**So that** I can fine-tune each day without going back to the summary grid.

**Acceptance criteria**

- [ ] Each meal slot in Calendar day columns has an "+ Add" button that opens an inline search input.
- [ ] Selecting an item creates an assignment for that day+meal and adds the item to the weekly summary if absent.
- [ ] Each item has a remove button; clicking it deletes the assignment.

---

## US-MP-009 Adjust servings in calendar day views

**As a** user  
**I want** to increase or decrease the number of servings for an item in a calendar day view  
**So that** portion sizes match what I will actually eat.

**Acceptance criteria**

- [ ] Each item has + and − controls.
- [ ] The − button decreases servings by 0.5 per tap, with a minimum of 0.5 (the item is never auto-removed by the − button alone).
- [ ] To remove an item entirely, the user uses the × remove button (see US-MP-008).
- [ ] The day's kcal total updates immediately after each change.

---

## US-MP-010 Drag items between meal slots and days in Calendar

**As a** user  
**I want** to drag a planned item from one meal slot or day to another in the Calendar  
**So that** I can rebalance my week quickly.

**Acceptance criteria**

- [ ] Items are draggable; a visual cue (opacity change) indicates the dragged item.
- [ ] Dropping on a different meal slot of the same day column reassigns the item to that meal slot.
- [ ] Dropping on a meal slot of a different day column changes both the day and the meal slot.
- [ ] The source column updates (item removed from old slot) and the target updates (item added to new slot).

---

## US-MP-011 View the week at a glance in Calendar view

**As a** user  
**I want** a compact calendar grid showing all planned items across the week  
**So that** I can quickly sense-check the week.

**Acceptance criteria**

- [ ] Calendar > Week sub-view shows seven columns (Mon–Sun).
- [ ] Each column shows items grouped by meal slot with serving count and kcal.
- [ ] Today's date is visually highlighted.
- [ ] Content reflects the same assignments as the Week summary tab.

---

## US-MP-012 Switch between week and month calendar sub-views

**As a** user  
**I want** to toggle the Calendar between a single-week view and a full-month view  
**So that** I can zoom out to see how my meals are distributed across the month.

**Acceptance criteria**

- [ ] A Day / 4 Days / Week / Month toggle appears within the Calendar tab.
- [ ] Week sub-view shows the 7 days of the currently selected week.
- [ ] Month sub-view shows a 6-week grid (42 cells, Mon–Sun columns) for the month containing the selected week.
- [ ] Days outside the current month are visually de-emphasised in the month view.
- [ ] Prev / Next month navigation buttons appear in month sub-view.

---

## US-MP-013 Add and remove meals in Calendar view

**As a** user  
**I want** to add items to a day and remove them directly in the Calendar  
**So that** I can edit my plan without switching to the Week summary.

**Acceptance criteria**

- [ ] Each day cell / column has a "+ Add" button that opens an inline search + meal-slot picker.
- [ ] Confirming the add creates an assignment for that day and slot and registers the item in the Week summary.
- [ ] Each item has an × button; clicking it removes that assignment.

---

## US-MP-014 Drag items between days in Calendar view

**As a** user  
**I want** to drag planned items from one day to another in the Calendar  
**So that** I can move meals to different days without re-entering them.

**Acceptance criteria**

- [ ] Items in calendar cells are draggable.
- [ ] Dropping on a different day cell moves the assignment to that day while keeping the original meal slot.
- [ ] The source and target cells update immediately.

---

## US-MP-015 See active diet label in the planner header

**As a** user who has set a diet preference in their profile  
**I want** to see my active diet displayed in the planner header  
**So that** I can plan meals with my dietary context in view without switching to the Personal cabinet.

**Acceptance criteria**

- [ ] When a diet is selected in Personal cabinet, its name appears as a label in the Meal planner header.
- [ ] The label is informational only — the planner does not filter or enforce diet rules automatically.
- [ ] If no diet is selected in the profile, no label is shown.

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

## US-MP-017 Day and 4-day sub-views in Calendar

**As a** user who wants a focused view of one or a few days  
**I want** to switch the Calendar to a single-day or 4-day layout  
**So that** I can see and edit meals in more detail than the full-week grid allows.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Tab 2 Calendar

**Acceptance criteria**

- [ ] A **Day / 4 Days / Week / Month** button group appears within the Calendar tab.
- [ ] Day sub-view shows one day column divided into four meal slots: Breakfast, Lunch, Dinner, Snacks. Each slot shows items with serving count, kcal, and +/− controls.
- [ ] 4 Days sub-view shows 4 consecutive day columns, each with the same per-slot layout as the Day sub-view.
- [ ] Both Day and 4 Days sub-views support add, remove, and serving-count adjustment.
- [ ] Drag-and-drop between the visible day columns is supported in 4 Days sub-view.
- [ ] Selecting a day in Week or Month sub-view and switching to Day sub-view shows that selected day.

---

## US-MP-018 Calendar plan summary and drag from summary

**As a** user planning in the Calendar tab  
**I want** to see a summary of all planned items above the calendar grid, organised by meal slot, and drag items from that summary to a day  
**So that** I can quickly assign planned items to specific days without switching tabs.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Plan summary

**Acceptance criteria**

- [ ] A plan summary panel is shown at the top of the Calendar tab, **organised as a gallery grouped by meal slots** (Breakfast, Lunch, Dinner, Snacks columns). Each slot group contains item cards showing item name, total servings, and kcal.
- [ ] The user can drag an item from the summary panel onto a day cell to create an assignment for that day in a chosen meal slot.
- [ ] After dragging from the summary, the item remains in the summary (it is still part of the plan; only a new day assignment is created).
- [ ] Dragging an item from one day cell to another moves the assignment: the item disappears from the source day and appears on the target day in the same meal slot.
- [ ] The plan summary updates immediately when assignments are added or removed.

---

## US-MP-019 Nutrition progress and target-reaching summary in planner

**As a** user tracking my nutritional goals  
**I want** to see the percentage of my target corridor consumed for each planned day, and weekly and monthly summaries, with a per-macro target-reaching display in Calendar  
**So that** I can plan ahead to stay on target across all macros.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Nutrition progress

**Acceptance criteria**

- [ ] In Calendar sub-views, each day column shows the day's planned kcal as a percentage of the user's calorie target corridor.
- [ ] In Calendar sub-views, each day column additionally shows a **target-reaching summary** (same format as the Personal cabinet Meal tracking display): kcal, protein, fat, and carbs planned vs. target corridor, each with a colour-coded indicator (green = within corridor, amber = approaching limit, red = above).
- [ ] In Week summary, a summary strip shows average % of target for calories, protein, fat, and carbs across the planned week.
- [ ] A monthly summary view shows the same averages aggregated across the selected month. The monthly summary is accessible by switching the Calendar to the Month sub-view; it aggregates % of target across all days that have at least one assignment.
- [ ] Percentage bars or labels use a visual indicator (e.g. green for within corridor, amber for approaching, red for above).
- [ ] If no diet/calorie target is set in the profile, the percentage strip and target-reaching summary are not shown.

---

## US-MP-020 Search results sorted by recently used, then user-owned, then alphabetical

**As a** user adding items to the planner  
**I want** the item search suggestions to show recently used items first, then items I own, then everything else alphabetically  
**So that** commonly planned and personal items are always at the top without scrolling.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Search sorting

**Acceptance criteria**

- [ ] In all item search inputs within the planner (Week summary, Calendar), suggestions are sorted: recently planned or recently logged items first, then items owned by the current user (isUserAdded), then all others alphabetically.
- [ ] "Recently used" is defined as items that appear in the current or previous week's assignments, or in recent tracking log entries.
- [ ] Items not recently used are shown after the recently-used group, user-owned next, then alphabetically.
- [ ] The sort order is applied in real time as the user types.

---

## US-MP-021 Log an individual planned item to Meal tracking

**As a** user reviewing my meals in the Calendar  
**I want** to log a single item directly from the calendar without logging the entire day  
**So that** I can mark only what I actually ate, one item at a time.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Log from plan

**Acceptance criteria**

- [ ] Each item in **Calendar** sub-views (Day, 4 Days, Week) shows a **"+ Log"** per-item action.
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

**As a** user planning in the Calendar tab  
**I want** to add an item to a specific meal slot in the plan summary panel without switching views  
**So that** I can build my plan quickly from within the Calendar tab itself.

Source: [06_meal_planner.md](../requirements/06_meal_planner.md) — Plan summary — Add to summary

**Acceptance criteria**

- [ ] Each meal slot column in the plan summary panel has an **add (+)** button visible in the slot header.
- [ ] Clicking the + button opens an inline search input within that slot column.
- [ ] Typing in the search input filters all items (products and recipes) by name in real time.
- [ ] Selecting an item from the search results adds it as an assignment on the first visible day in that slot.
- [ ] The plan summary updates immediately to show the newly added item.
- [ ] The search input closes after an item is selected; clicking + again re-opens it.
