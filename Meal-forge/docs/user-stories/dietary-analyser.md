# User stories: dietary analyser

Requirements: [02_dietary_analyser.md](../requirements/02_dietary_analyser.md)

---

## US-DA-001 View supported diets

**As a** user choosing how to eat  
**I want** to see a list of supported nutrition systems or diet patterns  
**So that** I can pick one that matches my goals.

**Acceptance criteria**

- [ ] The module presents multiple named diets (covering at least the examples in requirements: Mediterranean, plant-based/flexitarian, MIND, DASH, paleo, WW, intermittent fasting, keto, volumetrics, protein-focused, healthy fats, hydration, and similar).
- [ ] Each entry is selectable or openable for more detail.

---

## US-DA-002 Read diet description and macros guidance

**As a** user  
**I want** each diet to include a short description and, where relevant, guidance on daily protein, fat, and carbohydrate split  
**So that** I understand how to follow it in practice.

**Acceptance criteria**

- [ ] Every diet has a concise description visible in the UI.
- [ ] Where applicable, macro split or intake guidance is shown (or explicitly marked as not applicable for that pattern).

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
