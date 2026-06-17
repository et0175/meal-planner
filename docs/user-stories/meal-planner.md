# User stories: meal planner

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
**I want** to switch between Weekly summary, Day cards, and Calendar tabs  
**So that** I can edit, browse, or review my plan in the format that suits the task.

**Acceptance criteria**

- [ ] Three tabs are visible: Weekly summary, Day cards, Calendar.
- [ ] Selecting a tab shows its content and hides the others.
- [ ] All three tabs reflect the same selected week and the same underlying assignments.

---

## US-MP-003 Build a weekly meal plan in the summary grid

**As a** user  
**I want** to fill in a spreadsheet-style grid with items and servings per day per meal slot  
**So that** I can see and edit my entire week at a glance.

**Acceptance criteria**

- [ ] The grid is grouped into four sections: Breakfast, Lunch, Dinner, Snacks.
- [ ] Each row has a product/recipe search input and seven day columns (Mon–Sun).
- [ ] Entering a number in a day cell creates or updates that assignment.
- [ ] Clearing or zeroing a cell removes the assignment.

---

## US-MP-004 Add and remove items from the weekly summary

**As a** user  
**I want** to add new rows to any meal slot and remove rows I no longer need  
**So that** my summary reflects the current plan.

**Acceptance criteria**

- [ ] Each meal slot section has an "Add item" button that appends a blank row to that section.
- [ ] Removing a row removes all assignments for that item+meal-slot combination; other slots for the same item are unaffected.

---

## US-MP-005 Toggle between servings and grams per row

**As a** user who thinks in weight rather than servings  
**I want** to switch a row in the summary grid between servings mode and grams mode  
**So that** I can enter the quantity in the unit I actually measure.

**Acceptance criteria**

- [ ] Each row shows a "srv / g" toggle.
- [ ] Grams mode is available only for items that have a gram weight per serving defined.
- [ ] Switching modes converts existing values without changing the underlying serving count.
- [ ] In grams mode, a secondary label shows the equivalent serving count, and vice versa.

---

## US-MP-006 Weekly-selected items populate the summary automatically

**As a** user  
**I want** products and recipes I mark "This week" to appear in the planner summary  
**So that** I do not have to add them manually.

**Acceptance criteria**

- [ ] Marking an item "This week" in All products or Recipes adds it to the Lunch slot of the Weekly summary.
- [ ] Items are not duplicated if already present in that slot.

---

## US-MP-007 View and manage meals on day cards

**As a** user  
**I want** each day of the week to show its planned meals divided by Breakfast, Lunch, Dinner, and Snacks  
**So that** I can see and adjust what I am eating each day.

**Acceptance criteria**

- [ ] Day cards view shows seven cards, one per day, in horizontal scroll.
- [ ] Each card has four sections: Breakfast, Lunch, Dinner, Snacks.
- [ ] Each section lists the items assigned to that slot on that day, with kcal and servings.
- [ ] The day card shows an aggregated nutrition strip (kcal, protein, fat, carbs) when there is at least one item.

---

## US-MP-008 Add and remove meals from day card sections

**As a** user  
**I want** to add items directly to a specific meal slot on a day card and remove items I no longer want  
**So that** I can fine-tune each day without going back to the summary grid.

**Acceptance criteria**

- [ ] Each section has an "+ Add" button that opens an inline search input.
- [ ] Selecting an item creates an assignment for that day+meal and adds the item to the weekly summary if absent.
- [ ] Each item has a remove button; clicking it deletes the assignment.

---

## US-MP-009 Adjust servings on day cards

**As a** user  
**I want** to increase or decrease the number of servings for an item on a day card  
**So that** portion sizes match what I will actually eat.

**Acceptance criteria**

- [ ] Each item has + and − controls.
- [ ] Reducing servings to zero or below removes the item from the section.
- [ ] The day's kcal total updates immediately.

---

## US-MP-010 Drag items between meal slots and days

**As a** user  
**I want** to drag a planned item from one meal slot or day to another  
**So that** I can rebalance my week quickly.

**Acceptance criteria**

- [ ] Items are draggable; a visual cue (opacity change) indicates the dragged item.
- [ ] Dropping on a different section of the same card changes the meal slot.
- [ ] Dropping on a section of a different day card changes both the day and the meal slot.
- [ ] The source card updates (item removed from old slot) and the target updates (item added to new slot).

---

## US-MP-011 View the week at a glance in Calendar view

**As a** user  
**I want** a compact calendar grid showing all planned items across the week  
**So that** I can quickly sense-check the week without scrolling through day cards.

**Acceptance criteria**

- [ ] Calendar view shows seven columns (Mon–Sun).
- [ ] Each column lists item thumbnails, names, meal slot label, and servings for that day.
- [ ] Today's date is visually highlighted.
- [ ] Content reflects the same assignments as the other two tabs.

---

## US-MP-012 Switch between week and month calendar sub-views

**As a** user  
**I want** to toggle the Calendar between a single-week view and a full-month view  
**So that** I can zoom out to see how my meals are distributed across the month.

**Acceptance criteria**

- [ ] A Week / Month toggle appears within the Calendar tab.
- [ ] Week sub-view shows the 7 days of the currently selected week.
- [ ] Month sub-view shows a 6-week grid (42 cells, Mon–Sun columns) for the month containing the selected week.
- [ ] Days outside the current month are visually de-emphasised in the month view.
- [ ] Prev / Next month navigation buttons appear in month sub-view.

---

## US-MP-013 Add and remove meals in Calendar view

**As a** user  
**I want** to add items to a day and remove them directly in the Calendar  
**So that** I can edit my plan without switching to Day cards.

**Acceptance criteria**

- [ ] Each day cell has a "+ Add" button that opens an inline search + meal-slot picker.
- [ ] Confirming the add creates an assignment for that day and slot and registers the item in the Weekly summary.
- [ ] Hovering an item reveals an × button; clicking it removes that assignment.

---

## US-MP-014 Drag items between days in Calendar view

**As a** user  
**I want** to drag planned items from one day to another in the Calendar  
**So that** I can move meals to different days without re-entering them.

**Acceptance criteria**

- [ ] Items in calendar cells are draggable.
- [ ] Dropping on a different day cell moves the assignment to that day while keeping the original meal slot.
- [ ] The source and target cells update immediately.
