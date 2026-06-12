# User stories: meal planner

Requirements: [05_meal_planner.md](../requirements/05_meal_planner.md)

---

## US-MP-001 Choose planning date range

**As a** user planning meals  
**I want** to set a from–to date range with the current week as the default  
**So that** I can plan exactly the period I care about.

**Acceptance criteria**

- [ ] Date range defaults to the current calendar week (start through end).
- [ ] User can change start and end dates; the planner updates to that span.

---

## US-MP-002 See one card per day and a meal-prep summary

**As a** user  
**I want** one card per day in the range plus a summary of all dishes in the period  
**So that** I see both the weekly pool and the per-day layout.

**Acceptance criteria**

- [ ] Each day in the selected range renders as its own card.
- [ ] A meal-prep summary section lists all dishes planned for the entire selected period.

---

## US-MP-003 Weekly selections feed the summary

**As a** user  
**I want** products and recipes I marked for the current week to appear in the summary area  
**So that** I plan from the set I already shortlisted.

**Acceptance criteria**

- [ ] Items marked “selected for current week” in product and recipe modules appear in the planner summary (per integration contract).
- [ ] User can filter and select from these items to add them into planning UI state.

---

## US-MP-004 Build summary with drag-and-drop or equivalent

**As a** user  
**I want** to move products and recipes into the summary using drag-and-drop or another clear interaction  
**So that** assembling the weekly pool feels fast.

**Acceptance criteria**

- [ ] User can place items into the summary via drag-and-drop if the platform supports it, with an accessible alternative if not.
- [ ] Summary content updates immediately when items are added or removed.

---

## US-MP-005 Organize summary into menu sections

**As a** user  
**I want** to group summary items into sections such as breakfasts, lunches, dinners, desserts, salads, and snacks  
**So that** the weekly pool matches how I think about menus.

**Acceptance criteria**

- [ ] Default section set matches requirements or sensible defaults; user can assign items to sections.
- [ ] User can add, delete, and rename summary sections.

---

## US-MP-006 Configure sections on day cards

**As a** user  
**I want** each day card to start with breakfast, lunch, dinner, and snacks and let me change sections  
**So that** unusual schedules still fit.

**Acceptance criteria**

- [ ] New day cards include breakfast, lunch, dinner, and snacks by default.
- [ ] User can add, delete, and rename sections on a day card independently of other days if that is the product rule (or per UX spec).

---

## US-MP-007 Place items from summary onto days without removing from summary

**As a** user  
**I want** to drag items from the summary onto a day and section while keeping them in the summary  
**So that** the weekly pool stays visible as I assign meals.

**Acceptance criteria**

- [ ] Dragging from summary to a day card adds the item to that section without removing it from the summary.
- [ ] A section can hold zero or more items.

---

## US-MP-008 Reorder across days and sections

**As a** user  
**I want** to drag items between day cards and between sections on the same day  
**So that** I can rebalance the week quickly.

**Acceptance criteria**

- [ ] Moves between days update both source and target sections correctly.
- [ ] Moves within one day between sections behave consistently with the same interaction model.

---

## US-MP-009 Select items without drag-and-drop

**As a** user who prefers clicks or keyboard  
**I want** to assign items to days or summary without relying on drag-and-drop  
**So that** the planner remains usable for everyone.

**Acceptance criteria**

- [ ] Non-drag selection path exists (menus, buttons, or pickers) that achieves the same placements.
- [ ] Behavior matches requirement: selections still integrate with the summary as specified.

---

## US-MP-010 Remove items from day cards and sync summary

**As a** user  
**I want** removing an item from a day to remove it from the summary only when it is not used on any other day  
**So that** unused dishes drop out of the weekly pool automatically.

**Acceptance criteria**

- [ ] Deleting from a day card removes the item from that section only.
- [ ] If the item appears on no other day card, it is removed from the summary; otherwise it remains in the summary.

---

## US-MP-011 Set servings per dish on a day

**As a** user  
**I want** to set the number of servings for each dish on a day card  
**So that** nutrition and shopping quantities scale correctly.

**Acceptance criteria**

- [ ] Servings control exists per dish on a day card with sensible defaults (for example 1).
- [ ] Nutrition summary for the day respects servings multipliers.

---

## US-MP-012 Day card nutrition summary

**As a** user  
**I want** each day card to show a nutrition summary for everything scheduled that day  
**So that** I can see if daily targets are met before I shop.

**Acceptance criteria**

- [ ] Day card displays aggregated nutrition for all items in all sections for that day.
- [ ] Totals update when items or servings change.

---

## US-MP-013 Generate or refresh shopping list from plan

**As a** user  
**I want** to generate a shopping list from the meal plan or refresh an existing list from the current plan  
**So that** buying matches what I intend to cook.

**Acceptance criteria**

- [ ] User can create a shopping list from the current meal plan state.
- [ ] User can refresh an existing shopping list so it reflects the latest plan without orphan items (per merge rules defined by the product).
