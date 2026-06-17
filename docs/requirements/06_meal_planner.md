# Business requirements: meal planner

A module for planning meals across a selected calendar week.

## Week selection

- The planner operates on a single calendar week (Monday–Sunday).
- By default, the current calendar week is selected.
- The user can navigate to previous or next weeks, and jump back to the current week.

## Three views (tabs)

The planner offers three tab-switchable views that share the same selected week.

---

### Tab 1 — Weekly summary

Displays the week's meal plan as a spreadsheet grid, grouped by meal slot.

- The grid is divided into four meal slots: **Breakfast**, **Lunch**, **Dinner**, **Snacks**.
- Within each meal slot, each row represents one product or recipe.
- **Column 1 — Item:** free-text search input that narrows the list as the user types; selecting a match pins the item to that row.
- **Columns 2–8 — Mon–Sun:** numeric input for the number of servings on each day; empty cells mean that item is not planned for that day.
- The user can toggle each row between **servings** mode and **grams** mode (grams mode is available only when the item has a gram weight per serving defined).
- When grams mode is active, the secondary label shows the equivalent servings count, and vice versa.
- The user can add rows to any meal slot via an "Add item" button at the bottom of each meal slot.
- The user can remove individual rows; doing so also removes the corresponding assignments for that item and meal slot only (other meal slots for the same item are unaffected).
- Items marked "This week" in All products or Recipes are automatically added to the Lunch slot of the summary.

---

### Tab 2 — Day cards

Displays one scrollable card per day of the selected week.

- Each card shows the day name and date.
- Each card is divided into four meal slots: **Breakfast**, **Lunch**, **Dinner**, **Snacks**.
- Each meal slot shows the items assigned on that day, with their serving count and kcal contribution.
- The user can add an item to a meal slot via an inline search input (the item is also added to the weekly summary in the corresponding meal slot if not already present).
- The user can remove an item from a meal slot.
- The user can adjust servings per item with +/− controls.
- **Drag and drop:** items are draggable within and across cards:
  - Drag to a different meal slot on the same card.
  - Drag to a meal slot on a different day card to reassign the day (and optionally the meal slot).
- Each day card shows a total nutrition summary (kcal, protein, fat, carbs) for all items across all meal slots that day.

---

### Tab 3 — Calendar

The calendar offers four sub-views toggled by a **Day / 4 Days / Week / Month** button group. All sub-views share the same selected week and underlying assignments.

#### Plan summary (all sub-views)

- A collapsible **plan summary panel** is shown at the top of the Calendar tab (above the sub-view grid), similar in structure to the plan summary in the Shopping list.
- The panel lists all items planned within the visible date range, showing item name, total servings across the range, and total kcal contribution.
- **Drag from summary:** the user can drag an item from the summary panel onto any day cell to create an assignment for that day. The item remains in the summary after the drag (it is still planned; only a new day assignment is added).
- **Drag between days:** items are draggable between day cells; dropping an item from one day cell onto another moves the assignment (the item disappears from the source day and appears on the target day in the same meal slot).

#### Day sub-view

- Shows a single day column: the currently selected day.
- Lists all planned items for that day, grouped by meal slot, with serving count and kcal.
- Supports add, remove, and serving adjustment.

#### 4 Days sub-view

- Shows 4 consecutive day columns starting from the currently selected day.
- Each column lists planned items grouped by meal slot.
- Supports add, remove, drag between the four visible day columns, and drag from the summary.

#### Week sub-view

- A 7-column grid (Mon–Sun) for the selected week.
- Each day cell shows all planned items across all meal slots, with thumbnails, names, meal slot label, and serving count.
- Today's date is highlighted with a teal circle.
- **Add:** each day cell has an inline "+ Add" panel — the user types to search for an item and selects a meal slot (Breakfast / Lunch / Dinner / Snacks), then confirms. The item is also added to the Weekly summary in the chosen slot if not already present.
- **Remove:** hovering an item reveals an × button that removes that assignment.
- **Drag and drop:** items are draggable between day cells; dropping preserves the original meal slot and updates only the day.

#### Month sub-view

- A 6-week × 7-column grid (Mon–Sun columns, 42 cells total) for the month containing the selected week.
- A **Prev / Next month** navigation pair appears in the calendar header (separate from the week navigation).
- Days outside the current calendar month are visually de-emphasised.
- Each cell has the same add, remove, and drag-and-drop capabilities as the week sub-view.
- Cells are compact (no kcal strip) to fit the larger grid.

---

## Data consistency

- Assignments made in the Weekly summary are immediately reflected in Day cards and Calendar, and vice versa.
- The weekly summary and day cards share the same underlying assignment data keyed by (item, day, meal slot).
- Adding an item in the calendar automatically registers it in the weekly summary in the selected meal slot.

## Search sorting

- In all item search inputs within the planner (Weekly summary, Day cards, Calendar), results are sorted with **recently used items** (recently planned or recently logged in tracking) shown first.

## Log from plan

> **Decision (OQ-008):** Log from plan is now included in MVP.

- The planner provides **"Log this day"** and **"Log this week"** actions:
  - **Log this day** — creates Meal tracking entries in the Personal cabinet for all assignments on the currently selected day. The item, serving count, and meal slot are pre-filled.
  - **Log this week** — creates Meal tracking entries for all assignments across the selected week (Mon–Sun).
- Created entries are editable in the Meal tracking section of the Personal cabinet.

## Nutrition progress

- The planner (Weekly summary and Day cards) shows, for each day, the **percentage of the calorie corridor consumed** relative to the user's target corridor (as set in Personal cabinet).
- A weekly summary strip shows the average % of target for calories, protein, fat, and carbs across the planned week.
- A monthly summary shows the same averages aggregated by month.

## Profile integration

- The planner header displays the user's currently active diet (as set in Personal cabinet) so they can see their dietary context while planning.
- The planner does not enforce diet rules automatically; the active diet label is informational only.
