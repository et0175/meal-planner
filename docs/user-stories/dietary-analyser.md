# User Stories: Dietary Analyser

Requirements: [03_dietary_analyser.md](../requirements/03_dietary_analyser.md)

---

## US-DA-001 View supported diets

**As a** user choosing how to eat  
**I want** to see a list of supported nutrition systems or diet patterns  
**So that** I can pick one that matches my goals.

**Acceptance criteria**

- [ ] The module presents exactly the 12 named diets defined in requirements: Mediterranean, plant-based/flexitarian, MIND, DASH, paleo, WW, intermittent fasting, keto, volumetrics, protein-focused, healthy fats, hydration.
- [ ] Each entry is selectable or openable for more detail.
- [ ] No UI is provided for adding or editing diets in MVP1 (the list is static).

---

## US-DA-002 Read diet description, macros guidance, and pie chart

**As a** user  
**I want** each diet to include a short description, macro split guidance, and a visual pie chart of the macro proportions  
**So that** I can quickly grasp what a diet emphasises without reading numbers.

**Acceptance criteria**

- [ ] Every diet has a concise description visible in the UI.
- [ ] Where applicable, macro split or intake guidance is shown (or explicitly marked as not applicable for that pattern).
- [ ] Where a percentage macro split is defined, a **pie chart** is shown displaying protein, fat, and carbohydrate proportions by caloric contribution (matching the visual style on product and recipe cards).
- [ ] Diets without a defined percentage split (e.g. WeightWatchers, intermittent fasting) do not show a pie chart; the macro section shows a text note instead.

---

## US-DA-003 Mark product compatibility with a diet

**As a** user or nutritionist  
**I want** to mark a product as acceptable for a given diet  
**So that** filtering and planning respect dietary rules.

**Acceptance criteria**

- [ ] User can associate a product with one or more diets (or mark compatibility according to the chosen data model).
- [ ] Compatibility is persisted and visible when viewing the product.

---

## US-DA-004 Mark recipe compatibility with a diet

**As a** user or nutritionist  
**I want** to mark a recipe as acceptable for a given diet  
**So that** recipe search and meal planning can filter by diet.

**Acceptance criteria**

- [ ] User can associate a recipe with one or more diets (or mark compatibility per the data model).
- [ ] Compatibility is persisted and used by recipe search/filter (see recipe analyser stories).

---

## US-DA-005 Browse products and recipes for a specific diet

**As a** user  
**I want** to click on a diet card and see all products and recipes that are compatible with that diet  
**So that** I can explore what I can eat on a given diet without manually applying filters.

Source: [03_dietary_analyser.md](../requirements/03_dietary_analyser.md) — UI / Prototype spec

**Acceptance criteria**

- [ ] Clicking a diet card navigates to a combined filtered view showing all **products** tagged with that diet and all **recipes** tagged with that diet.
- [ ] The view is clearly labelled with the diet name (e.g. "Mediterranean — compatible foods").
- [ ] Products and recipes are presented in separate sections or clearly identified groups within the same screen.
- [ ] A back control or breadcrumb returns the user to the diet catalogue without resetting other navigation state.
- [ ] If no products or recipes are tagged for that diet, the respective section shows a helpful empty state.
