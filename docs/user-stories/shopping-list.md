# User Stories: Shopping List

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

- [ ] A plan summary section lists each planned item with its name and total servings planned across the selected range.
- [ ] Items with zero assignments in the range are not shown.

---

## US-SL-004 View a categorised grocery list

**As a** user  
**I want** all planned items — recipe ingredients and standalone products — aggregated and grouped by category  
**So that** I can shop efficiently by section of the supermarket.

**Acceptance criteria**

- [ ] Planned recipes are expanded into their ingredients; each ingredient becomes a grocery line.
- [ ] Standalone products added directly to the planner appear as single-line entries under their product category (no ingredient decomposition).
- [ ] Quantities for the same ingredient or product across multiple entries are aggregated into one line.
- [ ] Lines are grouped by category: Produce, Dairy, Meat, Fish, Grains, Legumes, Nuts & Seeds, Beverages, Condiments, Other.
- [ ] Each line shows: name, total quantity, and unit.

---

## US-SL-005 Know when the grocery list is out of date and regenerate it

**As a** user who has made changes to their meal plan after generating a grocery list  
**I want** to see that the list is stale and refresh it with one action  
**So that** I do not shop from an outdated list.

**Acceptance criteria**

- [ ] After the grocery list is generated, any change to the meal plan within the selected date range marks the list as stale (a visible indicator is shown).
- [ ] The stale indicator is visible without leaving the Shopping list view.
- [ ] A "Refresh" action regenerates the list from the current plan state; the stale indicator clears.
- [ ] Changing the date range also clears the previous list and triggers regeneration.
- [ ] An invalid date range (end date before start date) shows a validation error and does not generate a list.

---

## US-SL-006 Grocery list generated automatically on navigation

**As a** user navigating to the Shopping list  
**I want** the grocery list to be generated immediately without any extra action  
**So that** I can see my shopping needs at a glance as soon as I open the view.

Source: [07_shopping_list.md](../requirements/07_shopping_list.md)

**Acceptance criteria**

- [ ] Navigating to the Shopping list view automatically generates the grocery list for the default date range (current calendar week) without requiring a button press.
- [ ] The plan summary and grocery list sections are populated on first load.
- [ ] Changing the date range immediately regenerates the list from the new range without requiring a separate trigger.
- [ ] Stale detection still applies: if the plan changes after the auto-generated list is shown, the stale indicator appears.

---

## US-SL-007 Download grocery list as PDF

**As a** user who wants to shop without a phone  
**I want** to download my grocery list as a PDF  
**So that** I can print or share it and use it without the app.

Source: [07_shopping_list.md](../requirements/07_shopping_list.md) — PDF download

**Acceptance criteria**

- [ ] A **"Download PDF"** button is visible in the shopping list view.
- [ ] Triggering it downloads a PDF containing the categorised grocery list: all groups (Produce, Dairy, Meat, Fish, Grains, Legumes, Nuts & Seeds, Beverages, Condiments, Other) with ingredient name, total quantity, and unit per line.
- [ ] The PDF header shows the selected date range.
- [ ] Empty categories are omitted from the PDF.
- [ ] If the grocery list is empty (no items in range), the PDF still downloads with the date range header and a "No items" note.
