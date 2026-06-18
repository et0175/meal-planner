# Business requirements: dietary analyser

> **Decision (OQ-002):** The diet list is static in MVP1. The 12 patterns below are hardcoded; adding or changing a diet requires a code change and release.

---

## Functional requirements

- The module lists multiple nutrition systems or diet patterns. The diet list is static in MVP1 (12 patterns hardcoded):

  - Mediterranean diet
  - Plant-based and flexitarian
  - MIND diet
  - DASH diet
  - Paleo diet
  - WeightWatchers (WW)
  - Intermittent fasting
  - Ketogenic (keto) diet
  - Volumetrics
  - Protein-focused patterns
  - Healthy fats emphasis
  - Hydration guidance

- Each diet includes a short description and, where applicable, guidance on splitting daily intake across protein, fat, and carbohydrate.
- Users can mark products and recipes as compatible with a given diet.

---

## UI / Prototype spec

- The diet list is presented as a browseable catalogue of cards, one card per diet.
- Each diet card shows the diet name, a short description, and — where the macro split is defined — a **pie chart** displaying the caloric proportion of protein, fat, and carbohydrates (matching the visual style used in the product and recipe detail views).
- **Clicking a diet card** navigates to a combined filtered view of all **products** and **recipes** tagged as compatible with that diet, allowing the user to browse compatible foods directly from the diet entry. A back control returns to the diet catalogue.
- No UI is provided for adding or editing diets in MVP1 (the list is static).
