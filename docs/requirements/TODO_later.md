# Features Deferred to Post-MVP1

The following items are explicitly out of scope for MVP1 and are recorded here for future planning.

1. Localise the application interface (UI strings, labels, and messages).
2. Localise the product database — **product names: delivered** (ADR-0012, FR-037, translated names with English fallback). Still deferred: translated **category** and **diet-tag** labels (controlled-vocabulary tables), and non-English translations for the imported USDA catalog.
3. Create a mobile application.
4. Tailor functionality for professional use cases, such as cooking in a restaurant or catering for banquets.
5. Allow the user to customise the measurement system, the week start day, and related locale settings.
6. ~~Allow users or administrators to add, edit, or remove diet definitions.~~ **Superseded (OQ-011, 2026-08-19):** the entire Dietary Analyser module (browsing, tagging, and filtering — not just editing) is now deferred to post-MVP1. See `03_dietary_analyser.md`.
7. Diet-dependent features in other modules, deferred alongside the Dietary Analyser module (OQ-011): active-diet selection and the Meal planner header's active-diet badge (`05_personal_cabinet.md`, `06_meal_planner.md`); diet filter/tagging on products and recipes (`01_products-database.md`, `04_recipe_analyser.md`); the Diet filter in Advanced Search (`10_advanced_search.md`).
