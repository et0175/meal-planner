# Vision — Meal Forge MVP

## The job

Meal Forge helps people plan their weekly meals, understand the nutrition of what they eat,
and generate a shopping list from their plan — all in one coherent web tool.

Today, meal planning is fragmented across spreadsheets, nutrition apps, and handwritten
grocery lists. Meal Forge collapses this into a single flow: browse products → build a
weekly plan → get a grocery list.

## Primary value

A user opens the app on Sunday, builds their meal plan for the week in 10–15 minutes,
downloads a grocery list, and shops from it. The core loop: **plan → shop → repeat**.

## Actors

| Actor | Description | MVP1 permissions |
|-------|-------------|-----------------|
| User | Authenticated individual — browses products, plans weekly meals, manages personal catalog entries | Full access to all MVP1 features |
| Nutritionist | Professional user who curates products and annotations | Identical to User in MVP1 (role stored, no UI differentiation) |
| System | Internal automated actor — nutrition aggregation, week-flag rollover, shopping list derivation | Internal only |

## The world it lives in

- **Frontend:** Next.js (TypeScript), deployed as a web application
- **Backend:** Separate Python service (REST API)
- **Auth:** Session-based, email + password
- **No external integrations** in v1 (no recipe import, no third-party data sources)
- **Units:** Metric (g, kg, ml, l) + US customary (oz, lb, fl oz, cups, tbsp, tsp)
- **Diet definitions:** 12 hardcoded diet patterns (static, no admin management in MVP1)

## v1 scope (Core Loop)

The architecture model covers five modules:

1. **Authentication** — register, sign-in, sign-out, password reset, session management
2. **Products Database** — global product catalog, user-added products, category browsing, weekly flags
3. **Meal Planner** — weekly planning grid, calendar views, nutrition targets, PDF export, log-from-plan
4. **Shopping List** — date-range grocery list derived from plan, category grouping, PDF export
5. **Navigation** — sidebar + topbar shell wrapping all modules

## Non-goals (explicit out-of-scope for MVP1)

- Mobile application (iOS / Android)
- Localisation (UI strings, product names in other languages)
- Restaurant or catering mode
- User-customisable locale settings (week start day, measurement system preference)
- Admin-managed diet definitions
- YouTube recipe import
- Multi-user / nutritionist-manages-client flows
- Products Analyser module (single-product deep nutrition analysis)
- Dietary Analyser module (diet pattern guidance)
- Recipe Analyser module (recipe creation, import, per-serving nutrition)
- Personal Cabinet module (user profile, meal tracking history, calorie corridor)
- Advanced Search module (cross-module search with diet/macro/ingredient filters)

## Open questions resolved before this architecture pass

| ID | Question | Decision |
|----|----------|----------|
| OQ-009 | Multi-ingredient filter in Advanced Search | AND + OR logic — deferred with AS module to v1.1 |
| OQ-010 | Per-100g filter basis in Advanced Search | Both per-serving and per-100g — deferred with AS module to v1.1 |
