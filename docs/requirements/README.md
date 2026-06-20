# Requirements — Meal Forge MVP

This folder contains the business requirements for Meal Forge. Each file covers one product module.  
**Update procedure:** [`../process-requirements-update.md`](../process-requirements-update.md)  
**User stories:** [`../user-stories/`](../user-stories/)  
**Test cases:** [`../test-cases/`](../test-cases/)

---

## Module files

| # | File | Module | Scope |
|---|------|--------|-------|
| 01 | [`01_products-database.md`](01_products-database.md) | Products database | Product catalog, units, week flags, user-added products |
| 02 | [`02_products-analyser.md`](02_products-analyser.md) | Products analyser | Single-product nutrition breakdown, serving-based input, macro table |
| 03 | [`03_dietary_analyser.md`](03_dietary_analyser.md) | Dietary analyser | 12 named diet patterns with macro guidance |
| 04 | [`04_recipe_analyser.md`](04_recipe_analyser.md) | Recipe analyser | Recipe creation, import, ingredient nutrition, per-serving analysis |
| 05 | [`05_personal_cabinet.md`](05_personal_cabinet.md) | Personal cabinet | User profile, meal tracking, calorie corridor, history |
| 06 | [`06_meal_planner.md`](06_meal_planner.md) | Meal planner | Weekly plan, calendar, nutrition targets, PDF export |
| 07 | [`07_shopping_list.md`](07_shopping_list.md) | Shopping list | Grocery list generation from plan, category grouping, PDF export |
| 08 | [`08_authentication.md`](08_authentication.md) | Authentication | Sign-in, registration, password reset, session management, roles |
| 09 | [`09_non-functional.md`](09_non-functional.md) | Non-functional | Performance targets, accessibility (WCAG 2.1 AA), data limits, browser support |

---

## Supporting files

| File | Purpose |
|------|---------|
| [`actors.yml`](actors.yml) | Canonical actor definitions — **User** (ACT-001), **Nutritionist** (ACT-002), **System** (ACT-003). Use only these names in requirements and stories. |
| [`open-questions.md`](open-questions.md) | Decision log for resolved ambiguities. Current highest: **OQ-008**. All questions resolved as of 2026-06-17. |
| [`TODO_later.md`](TODO_later.md) | Features explicitly deferred to post-MVP1 (localisation, mobile app, restaurant mode, etc.). |
| [`images/`](images/) | Diagrams and mockups referenced from requirement files. |

---

## How to make a requirements change

Full procedure: [`../process-requirements-update.md`](../process-requirements-update.md)

Quick reference for the most common cases:

### Adding a new requirement

1. Edit the relevant `NN_<module>.md` file.
2. If the change resolves an open question, record the decision in `open-questions.md` first (next ID: **OQ-009**) and add a `> **Decision (OQ-NNN):**` callout in the requirement.
3. Write or update user stories in `../user-stories/<module>.md` (new story ID: next `US-<MODULE>-NNN`).
4. Write a test case in `../test-cases/test-cases-detailed.md` (new ID: next `TC-<MODULE>-NNN`); set `**Status:** 🚫` until implemented.
5. If the prototype must change: update `prototype/frontend/app/page.tsx`, `types.ts`, and/or `data/seed.ts`; then flip the test case status to `✅`.

### Changing an existing requirement

Same as above, but also:
- Update the affected user story acceptance criteria.
- Update the affected test case expected result.
- If a previously passing test case no longer reflects the new behaviour, reset its status to `❓` or `❌`.

### Deferring a requirement to post-MVP1

1. Remove or clearly mark the requirement as out of scope in its module file.
2. Add a brief line to [`TODO_later.md`](TODO_later.md).
3. Mark the affected test cases `🚫`.

---

## Naming rules

### Actor names

Always use names from `actors.yml` exactly: **User**, **Nutritionist**, **System**. Never use "Cook", "Admin", "Planner", or any other name.

### Story IDs

`US-<MODULE>-NNN` — see the full prefix table in [`../process-requirements-update.md`](../process-requirements-update.md#naming-conventions).

> Note: The Products database story prefix is **US-PA** (not US-PRD). This is intentional and must not be changed.

### Test case IDs

`TC-<MODULE>-NNN` — see the prefix table in [`../process-requirements-update.md`](../process-requirements-update.md#naming-conventions).

### Open question IDs

`OQ-NNN` — sequential, never reused. Next available: **OQ-009**.

---

## Document map

```
docs/
├── requirements/           ← you are here
│   ├── README.md           ← this file
│   ├── 01_products-database.md
│   ├── ...
│   ├── 09_non-functional.md
│   ├── actors.yml
│   ├── open-questions.md
│   └── TODO_later.md
├── user-stories/
│   ├── README.md           ← module index
│   └── <module>.md         ← one file per module
├── test-cases/
│   ├── README.md           ← TC counts per module
│   ├── test-cases-detailed.md  ← authoritative TC source
│   └── tc-<module>.md      ← per-module TC files
└── process-requirements-update.md   ← full update procedure
```
