# Business Requirements: Meal Planner

A module for planning meals across a selected calendar week.

---

## Functional requirements

### Week selection

- The planner operates on a single calendar week (Monday–Sunday).
- By default, the current calendar week is selected.
- The user can navigate to previous or next weeks, and jump back to the current week.

### Four views (tabs)

The planner offers four tab-switchable views that share the same selected week: **Week summary**, **Grid view**, **2 Days**, and **Month**. The tabs are shown as a single row of pills; there is no separate "Calendar" wrapper tab — Grid view, 2 Days, and Month are top-level tabs in their own right.

- **Reorder tabs:** the user can drag a tab pill onto another to swap their positions in the row. The default order is Week summary, Grid view, 2 Days, Month. The order chosen by the user persists only for the current session (not saved across page reloads).

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

#### Tab 2 — Grid view

Shows a day × meal-slot matrix: one column per day (Mon–Sun), one row per meal slot (**Breakfast**, **Lunch**, **Dinner**, **Snacks**).

- Each day column header shows the day name/date plus a compact **calorie ring** (colour-coded against the user's target corridor: green within corridor, amber below, red above) and the day's total kcal.
- Each slot cell lists the items assigned to that day/slot, with serving count, kcal contribution, and +/− serving controls, plus a per-item **"+ Log"** action.
- Supports add, remove, drag between cells, and drag from the plan summary panel.
- Today's column is highlighted.
- On narrow viewports the grid scrolls horizontally instead of compressing columns (minimum ~150px per day column).

---

#### Tab 3 — 2 Days

- Shows 2 consecutive day columns, selected via a date scroller.
- Each column is divided into four meal slots (**Breakfast**, **Lunch**, **Dinner**, **Snacks**), with a per-day calorie ring and macro breakdown at the top of the column, an item list with serving count and kcal, and +/− serving controls.
- Supports add, remove, drag between the two visible day columns, drag from the plan summary panel, and per-item "+ Log".

---

#### Tab 4 — Month

- A 6-week × 7-column grid (Mon–Sun columns, 42 cells total) for the month containing the selected week.
- A **Prev / Next month** navigation pair appears in the calendar header (separate from the week navigation).
- Days outside the current calendar month are visually de-emphasised.
- **Read-only:** cells show up to 2 item names per day (plus a "+N more" overflow) with no kcal figures. There is no add, remove, or drag-and-drop capability, and no plan summary panel in this tab — the user switches to Grid view or 2 Days to edit a day.

##### Plan summary (Grid view and 2 Days only)

- A collapsible **plan summary panel** is shown at the top of the Grid view and 2 Days tabs (above the day grid), similar in structure to the plan summary in the Shopping list. It is not shown in Month, which is read-only.
- The panel lists all items planned within the visible date range, organised as a **gallery grouped by meal slots** (Breakfast, Lunch, Dinner, Snacks). Each slot group shows item cards with item name, total servings, and kcal contribution.
- **Drag from summary:** the user can drag an item from the summary panel onto any day cell to create an assignment for that day. The item remains in the summary after the drag (it is still planned; only a new day assignment is added).
- **Add to summary:** each meal slot column in the plan summary panel has an **add (+)** button. Clicking it opens an inline search input; typing filters all items by name; selecting an item adds it as an assignment on the first visible day in that slot.
- **Drag between days:** items are draggable between day cells; dropping an item from one day cell onto another moves the assignment (the item disappears from the source day and appears on the target day in the same meal slot).

---

### Data consistency

- Assignments created or modified in Week summary, Grid view, or 2 Days are immediately reflected in the other two — no refresh required. Month shows the same data but does not support editing.
- Week summary, Grid view, and 2 Days share the same underlying assignment data keyed by (item, day, meal slot). Month reads the same data but is display-only.
- Adding an item in Grid view or 2 Days automatically registers it in the weekly summary in the selected meal slot.

### Search sorting

- In all item search inputs within the planner (Week summary, Grid view, 2 Days), results are sorted: **recently used items** (recently planned or recently logged in tracking) first, then **items owned by the current user**, then all others alphabetically.

### Log from plan

> **Decision (OQ-008):** Log from plan is now included in MVP.

- The planner provides **"Log this day"** and **"Log this week"** bulk actions (available in all planner tabs):
  - **Log this day** — creates Meal tracking entries in the Personal cabinet for all assignments on the currently selected day. The item, serving count, and meal slot are pre-filled.
  - **Log this week** — creates Meal tracking entries for all assignments across the selected week (Mon–Sun).
- In addition to the bulk actions, each individual item in **Grid view** and **2 Days** shows a **"+ Log"** per-item action. Triggering it creates a single Meal tracking entry for that item, serving count, and meal slot on the selected day — without logging other items. Month is read-only and has no per-item log action.
- Created entries are editable in the Meal Tracking tab of the Personal cabinet.

### Nutrition progress

- The planner (Week summary, Grid view, and 2 Days) shows, for each day, the **percentage of the calorie corridor consumed** relative to the user's target corridor (as set in Personal cabinet).
- A week summary strip shows the average % of target for calories, protein, fat, and carbs across the planned week.
- Month does not show a nutrition summary — it is a read-only overview of which items are planned each day. The user switches to Grid view or 2 Days to see daily nutrition targets.
- **Grid view and 2 Days** additionally display a **target-reaching summary** per day column matching the Personal cabinet Meal tracking display: kcal, protein, fat, and carbs planned vs. target corridor, with colour-coded indicators (green for within corridor, amber for approaching, red for above).

### Profile integration

> 🚫 **Deferred to post-MVP1 (OQ-011):** this entire "Profile integration" section depends on active-diet selection in Personal cabinet, which is deferred along with the rest of the Dietary Analyser module (`03_dietary_analyser.md`). See `05_personal_cabinet.md` "Profile tab — Diet preferences" and `TODO_later.md`.

- ~~The planner header displays the user's currently active diet (as set in Personal cabinet) so they can see their dietary context while planning.~~
- ~~The planner does not enforce diet rules automatically; the active diet label is informational only.~~

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

### Tabs

- All four views (Week summary, Grid view, 2 Days, Month) sit in a single row of pills; tabs can be reordered by dragging one pill onto another to swap positions.
- Plan summary panel is collapsible and appears above the day grid in Grid view and 2 Days only. Items are presented in a **gallery layout** with one column per meal slot (Breakfast, Lunch, Dinner, Snacks); each column shows item cards.
- Grid view and 2 Days: today's column/date is highlighted (teal border/ring); each day header shows a compact colour-coded calorie ring.
- Month sub-view: read-only, cells are compact (no kcal strip) to fit the larger grid.
