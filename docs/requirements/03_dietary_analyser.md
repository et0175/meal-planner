# Business Requirements: Dietary Analyser

> ## 🚫 Deferred to post-MVP1
> **Decision (OQ-011, 2026-08-19):** The entire Dietary Analyser module — browsing the 12 diet patterns, macro guidance, diet cards, and product/recipe diet tagging — is out of scope for MVP1. This supersedes the earlier, narrower deferral of diet *editing* only (see `TODO_later.md`). The requirement text below is kept for historical/planning reference only; nothing in this file should be built for MVP1.
>
> Everywhere else in the docs that referenced an "active diet," a diet filter, or diet tagging has been marked deferred with a pointer back to this decision. See `open-questions.md` OQ-011 (and the now-moot OQ-002, which asked who manages the diet list — moot because the list itself is no longer in scope).

> **Decision (OQ-002 — historical, superseded by OQ-011):** The diet list is static in MVP1. The 12 patterns below are hardcoded; adding or changing a diet requires a code change and release.

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

- The diet list is presented as a browsable catalogue of cards, one card per diet.
- Each diet card shows the diet name, a short description, and — where the macro split is defined — a **pie chart** displaying the caloric proportion of protein, fat, and carbohydrates (matching the visual style used in the product and recipe detail views).
- **Clicking a diet card** navigates to a combined filtered view of all **products** and **recipes** tagged as compatible with that diet, allowing the user to browse compatible foods directly from the diet entry. A back control returns to the diet catalogue.
- No UI is provided for adding or editing diets in MVP1 (the list is static).
