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

- The grid is divided into four sections: **Breakfast**, **Lunch**, **Dinner**, **Snacks**.
- Within each section, each row represents one product or recipe.
- **Column 1 — Item:** free-text search input that narrows the list as the user types; selecting a match pins the item to that row.
- **Columns 2–8 — Mon–Sun:** numeric input for the number of servings on each day; empty cells mean that item is not planned for that day.
- The user can toggle each row between **servings** mode and **grams** mode (grams mode is available only when the item has a gram weight per serving defined).
- When grams mode is active, the secondary label shows the equivalent servings count, and vice versa.
- The user can add rows to any meal slot via an "Add item" button at the bottom of each section.
- The user can remove individual rows; doing so also removes the corresponding assignments for that item and meal slot only (other meal slots for the same item are unaffected).
- Items marked "This week" in the All products or Recipes catalog are automatically added to the Lunch slot of the summary.

---

### Tab 2 — Day cards

Displays one scrollable card per day of the selected week.

- Each card shows the day name and date.
- Each card is divided into four meal sections: **Breakfast**, **Lunch**, **Dinner**, **Snacks**.
- Each section shows the items assigned to that meal slot on that day, with their serving count and kcal contribution.
- The user can add an item to a section via an inline search input (the item is also added to the weekly summary in the corresponding meal slot if not already present).
- The user can remove an item from a section.
- The user can adjust servings per item with +/− controls.
- **Drag and drop:** items are draggable within and across cards:
  - Drag to a different section on the same card to change the meal slot.
  - Drag to a section on a different day card to reassign the day (and optionally the meal slot).
- Each day card shows a total nutrition summary (kcal, protein, fat, carbs) for all items across all sections that day.

---

### Tab 3 — Calendar

The calendar offers two sub-views toggled by a **Week / Month** button pair.

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
