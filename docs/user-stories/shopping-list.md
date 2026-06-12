# User stories: shopping list

Requirements: [07_shopping_list.md](../requirements/07_shopping_list.md)

---

## US-SL-001 Access shopping list as a separate view

**As a** user  
**I want** the shopping list to be its own navigation item  
**So that** I can generate and review my grocery list independently of the meal planner.

**Acceptance criteria**

- [ ] "Shopping list" appears as a dedicated item in the sidebar navigation.
- [ ] Navigating to it shows the shopping list view without affecting the planner state.

---

## US-SL-002 Select a date range for the shopping list

**As a** user  
**I want** to choose a from–to date range for the shopping list  
**So that** the list covers exactly the days I am shopping for.

**Acceptance criteria**

- [ ] Date range inputs (from and to) are available in the shopping list view.
- [ ] Changing either date updates the plan summary and grocery list immediately.
- [ ] The default range is the current calendar week.

---

## US-SL-003 See a summary of planned items in the range

**As a** user  
**I want** to see all planned meals within the selected date range summarised in one place  
**So that** I know which dishes I am shopping for.

**Acceptance criteria**

- [ ] A plan summary section lists each planned item with its total servings and kcal contribution across the selected range.
- [ ] Items with zero assignments in the range are not shown.

---

## US-SL-004 View a categorised grocery list

**As a** user  
**I want** the ingredients of all planned recipes aggregated and grouped by category  
**So that** I can shop efficiently by section of the supermarket.

**Acceptance criteria**

- [ ] Grocery list is derived from ingredients of all planned items in the date range.
- [ ] Lines are grouped by category: Produce, Dairy, Meat, Fish, Grains, Legumes, Nuts & Seeds, Beverages, Condiments, Other.
- [ ] Each line shows ingredient name, quantity, and unit.
- [ ] Quantities for the same ingredient across multiple recipes are aggregated.
