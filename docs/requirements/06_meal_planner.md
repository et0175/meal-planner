# Business requirements: meal planner

A module for planning meals across a selected calendar week.

---

## Functional requirements

### Week selection

- The planner operates on a single calendar week (Monday–Sunday).
- By default, the current calendar week is selected.
- The user can navigate to previous or next weeks, and jump back to the current week.

### Two views (tabs)

The planner offers two tab-switchable views that share the same selected week.

---

#### Tab 1 — Week summary

Displays the week's meal plan as a spreadsheet grid, grouped by meal slot.

- The grid is divided into four meal slots: **Breakfast**, **Lunch**, **Dinner**, **Snacks**.
- Within each meal slot, each row represents one product or recipe.
- **Column 1 — Item:** free-text search input that narrows the list as the user types; selecting a match pins the item to that row.
- **Columns 2–8 — Mon–Sun:** numeric input for the number of servings on each day; empty cells mean that item is not planned for that day.
- A dedicated **unit selector column** is present in the grid, allowing the user to switch each row between **servings mode** and **grams mode** (grams mode is available only when the item has a gram weight per serving defined).
- When grams mode is active, the secondary label shows the equivalent servings count, and vice versa.
- The user can add rows to any meal slot via an "Add item" button at the bottom of each meal slot.
- The user can remove individual rows; doing so also removes the corresponding assignments for that item and meal slot only (other meal slots for the same item are unaffected).
- Items marked "This week" in All products or Recipes are automatically added to the Lunch slot of the summary.

---

#### Tab 2 — Calendar

The calendar offers four sub-views toggled by a **Day / 4 Days / Week / Month** button group. All sub-views share the same selected week and underlying assignments.

##### Plan summary (all sub-views)

- A collapsible **plan summary panel** is shown at the top of the Calendar tab (above the sub-view grid), similar in structure to the plan summary in the Shopping list.
- The panel lists all items planned within the visible date range, organised as a **gallery grouped by meal slots** (Breakfast, Lunch, Dinner, Snacks). Each slot group shows item cards with item name, total servings, and kcal contribution.
- **Drag from summary:** the user can drag an item from the summary panel onto any day cell to create an assignment for that day. The item remains in the summary after the drag (it is still planned; only a new day assignment is added).
- **Drag between days:** items are draggable between day cells; dropping an item from one day cell onto another moves the assignment (the item disappears from the source day and appears on the target day in the same meal slot).

##### Day sub-view

- Shows a single day column divided into four meal slots: **Breakfast**, **Lunch**, **Dinner**, **Snacks**.
- Each meal slot lists the items assigned for that day, with serving count, kcal contribution, and +/− serving controls.
- Supports add, remove, and serving adjustment.

##### 4 Days sub-view

- Shows 4 consecutive day columns starting from the currently selected day.
- Each column is divided into four meal slots with the same per-slot layout as the Day sub-view.
- Supports add, remove, drag between the four visible day columns, and drag from the summary.

##### Week sub-view

- Shows 7 day columns (Mon–Sun) for the selected week.
- Each column is divided into four meal slots: **Breakfast**, **Lunch**, **Dinner**, **Snacks**.
- Items are listed per slot with serving count, kcal, and +/− controls.
- Today's date is highlighted.
- Supports add, remove, drag between day cells, and per-item "+ Log" action.

##### Month sub-view

- A 6-week × 7-column grid (Mon–Sun columns, 42 cells total) for the month containing the selected week.
- A **Prev / Next month** navigation pair appears in the calendar header (separate from the week navigation).
- Days outside the current calendar month are visually de-emphasised.
- Each cell has the same add, remove, and drag-and-drop capabilities as the week sub-view.
- Cells are compact (no kcal strip) to fit the larger grid.

---

### Data consistency

- Assignments made in any view are immediately reflected in all other views. An assignment created or modified in the Calendar tab is immediately visible in the Week summary tab and vice versa — no refresh required.
- The weekly summary and calendar views share the same underlying assignment data keyed by (item, day, meal slot).
- Adding an item in the calendar automatically registers it in the weekly summary in the selected meal slot.

### Search sorting

- In all item search inputs within the planner (Week summary, Calendar), results are sorted: **recently used items** (recently planned or recently logged in tracking) first, then **items owned by the current user**, then all others alphabetically.

### Log from plan

> **Decision (OQ-008):** Log from plan is now included in MVP.

- The planner provides **"Log this day"** and **"Log this week"** bulk actions (available in all planner tabs):
  - **Log this day** — creates Meal tracking entries in the Personal cabinet for all assignments on the currently selected day. The item, serving count, and meal slot are pre-filled.
  - **Log this week** — creates Meal tracking entries for all assignments across the selected week (Mon–Sun).
- In addition to the bulk actions, each individual item in the **Calendar** (Day, 4 Days, and Week sub-views) shows a **"+ Log"** per-item action. Triggering it creates a single Meal tracking entry for that item, serving count, and meal slot on the selected day — without logging other items.
- Created entries are editable in the Meal Tracking tab of the Personal cabinet.

### Nutrition progress

- The planner (Week summary and Calendar sub-views) shows, for each day, the **percentage of the calorie corridor consumed** relative to the user's target corridor (as set in Personal cabinet).
- A week summary strip shows the average % of target for calories, protein, fat, and carbs across the planned week.
- A monthly summary shows the same averages aggregated by month. The monthly summary is accessible by switching the Calendar to the Month sub-view; it aggregates average % of target across all days in the selected month that have at least one assignment.
- **Calendar sub-views** additionally display a **target-reaching summary** per day column matching the Personal cabinet Meal tracking display: kcal, protein, fat, and carbs planned vs. target corridor, with colour-coded indicators (green for within corridor, amber for approaching, red for above).

### Profile integration

- The planner header displays the user's currently active diet (as set in Personal cabinet) so they can see their dietary context while planning.
- The planner does not enforce diet rules automatically; the active diet label is informational only.

---

### PDF export

- The user can download the current week's meal plan (Week summary grid) as a **PDF file**.
- The file contains the full week grid: item names, days, serving counts, and totals.

> See also [`07_shopping_list.md`](07_shopping_list.md) — PDF download (grocery list PDF is a separate button in the Shopping list view).

---

## UI / Prototype spec

### Week summary

- Displayed as a spreadsheet grid: Column 1 is the item name / search input; a **unit selector column** follows; Columns 2–8 are Mon–Sun showing numeric serving counts.
- In grams mode the secondary label shows the equivalent servings count, and vice versa.
- "Add item" button at the bottom of each meal slot section.

### Calendar

- Sub-view toggled by a **"Day / 4 Days / Week / Month"** button group.
- Plan summary panel is collapsible and appears above the sub-view grid. Items are presented in a **gallery layout** with one column per meal slot (Breakfast, Lunch, Dinner, Snacks); each column shows item cards.
- Day, 4 Days, and Week sub-views each show per-day columns divided into meal slots, matching the layout formerly provided by the Day cards tab.
- Week sub-view: today's date is highlighted with a **teal circle**.
- Month sub-view: cells are compact (no kcal strip) to fit the larger grid.
