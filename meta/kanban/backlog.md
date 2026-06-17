# MealPlanner MVP1 — Backlog

_Seeded from `meta/architecture/handoff.md` and `meta/architecture/requirements.yml` (2026-06-12)_

## Increment 1 — Identity & Infrastructure

- [ ] User registration and sign-in with email/password  @enabler
- [ ] DB migrations and composition-root wiring (skeleton for all 4 contexts)  @enabler
- [ ] Language preference setting  @feature
- [ ] Unit system preference (metric / imperial)  @feature
- [ ] Demographic and body metrics profile  @feature
- [ ] Diet preferences and calorie corridor configuration  @feature

## Increment 2 — Product Catalog & Dietary Tagging

- [ ] OpenFoodFacts seed import (CLI job at deploy)  @enabler
- [ ] Browse products with full nutrition breakdown  @feature
- [ ] Filter products by category  @feature
- [ ] Search for a product by name or attributes  @feature
- [ ] Add a custom product with nutritional data  @feature
- [ ] Edit or delete own products  @feature
- [ ] Mark a product for the current week  @feature
- [ ] View list of supported diets  @feature
- [ ] Read diet description and macro guidance  @feature
- [ ] Mark product compatibility with a diet  @feature

## Increment 3 — Recipes & Nutrition Tracking

- [ ] Resolve DEC-003: recipe import sync vs. async (decision + ADR)  @enabler
- [ ] Browse recipes with nutrition summary and ingredients  @feature
- [ ] Filter recipes by category  @feature
- [ ] Filter favorites or own recipes  @feature
- [ ] Filter recipes by diet  @feature
- [ ] Search for a recipe  @feature
- [ ] Mark recipe as favorite  @feature
- [ ] Mark recipe for the current week  @feature
- [ ] Add a recipe manually  @feature
- [ ] Import a recipe from external sources (AI-backed, DEC-003)  @feature
- [ ] Open recipe card with full detail view  @feature
- [ ] Edit or delete own recipes  @feature
- [ ] Edit recipe ingredients  @feature
- [ ] Mark recipe compatibility with a diet  @feature
- [ ] Log meals and view daily nutrition summary  @feature

## Increment 4 — Meal Planning & Shopping List

- [ ] Choose planning date range  @feature
- [ ] See one day card per day and a meal-prep summary pool  @feature
- [ ] Weekly-marked items automatically populate the summary pool  @feature
- [ ] Build summary pool with drag-and-drop or equivalent  @feature
- [ ] Organize summary into named menu sections  @feature
- [ ] Configure sections shown on each day card  @feature
- [ ] Place items from summary pool onto specific days  @feature
- [ ] Reorder items across days and sections  @feature
- [ ] Select and assign items without drag-and-drop (keyboard / touch)  @feature
- [ ] Remove items from day cards and sync back to summary  @feature
- [ ] Set number of servings per dish per day  @feature
- [ ] Day card nutrition summary (per-day aggregate)  @feature
- [ ] Generate or refresh shopping list from current meal plan  @feature
