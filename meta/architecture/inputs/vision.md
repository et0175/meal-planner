# Vision: MealPlanner

## Product

MealPlanner is a personal nutrition and meal-planning application. It helps individuals plan weekly meals, track daily food intake against dietary goals, and build a reusable library of products and recipes.

## Target users

- **Individual user** — tracks what they eat, plans meals for the week, sets and follows dietary goals.
- **Nutritionist / planner** — curates products and recipes, annotates dietary compatibility, supports clients with structured plans.

## Core problem

Coordinating three tasks at once — choosing what to eat, verifying it fits a diet, and knowing what to buy — is fragmented across manual spreadsheets, generic calorie apps, and recipe sites. MealPlanner brings these into one coherent flow: browse → shortlist → plan → shop.

## Key modules and capabilities

| Module | Core capability |
|--------|----------------|
| **Product Analyser** | Searchable, filterable product catalog with per-product nutrition breakdown; user-owned custom products; weekly-selection tagging |
| **Recipe Analyser** | Recipe database with nutrition and ingredient-to-product linkage; import from PDF, URL, YouTube; weekly-selection tagging |
| **Dietary Analyser** | Library of 12+ named diet patterns (Mediterranean, keto, DASH, etc.) with macro guidance; product and recipe compatibility tagging |
| **Personal Cabinet** | User profile with body metrics; diet preference selection; calorie corridor recommendation; daily meal log with nutrition summary |
| **Meal Planner** | Weekly (or custom range) planning canvas: per-day cards, a shared summary pool, drag-and-drop assembly, servings control, and shopping list generation |

## Platform

Web + mobile long-term. **MVP1 is web only.** Domain architecture should remain platform-agnostic.

## Language

UI supports English and Ukrainian (confirmed by US-PC-002).

## Key constraints and decisions (MVP1)

- **Auth:** Email/password only. Social login deferred.
- **Body composition:** Simple metrics (weight, BMI). No wearable integrations.
- **Product / recipe catalog:** Shared global catalog. Users can only edit/delete entries they created.
- **Product database:** Pre-seeded from an external dataset (source TBD). Users can add custom entries.
- **Recipe import:** AI-assisted parsing (OpenAI direction); tech stack TBD — deferred to architecture decision.
- **Offline / download:** Meal plan and shopping list download are future considerations, not MVP1.

## Non-goals (MVP1)

- Social / sharing features
- Integration with external fitness trackers
- AI-generated meal plans (AI is used internally for recipe import parsing only)
- Mobile app
- Offline mode
