# Architecture Handoff — MealPlanner MVP1

Generated: 2026-06-12  
Architecture root: `meta/architecture/`  
Diagrams: `meta/architecture/c4/`  
Trace matrix: `meta/architecture/trace.yml`

---

## Implementation increments

### Increment 1 — Identity + infrastructure skeleton (9 stories)

**Scope:** Everything a user needs to exist: registration, login, profile, JWT issuance. Plus the shared database schema and composition-root wiring. This is the foundation all other increments depend on.

**Components:** COMP-009 (Auth Service), COMP-010 (User Profile Service), COMP-011 (Calorie Corridor Calculator), COMP-012 (JWT Token Issuer), COMP-014 (Identity DB), COMP-022 (Planning DB — skeleton), COMP-017 (Nutrition Tracking DB — skeleton), COMP-008 (Catalog DB — skeleton)

**Stories:**
- US-PC-001 Sign in and manage email and password
- US-PC-002 Set language preference
- US-PC-003 Set unit system
- US-PC-004 Maintain demographic and body metrics
- US-PC-005 Configure diet preferences and calorie corridor

**Requirements delivered:** FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, NFR-001 (auth middleware scaffolded), CON-002

**Key implementation notes:**
- JWT must embed `user_id`, `diet_preference_id`, and `calorie_corridor` (ADR-0006).
- `UpdateUserProfile` must trigger token refresh whenever any calorie-corridor input changes (ADR-0006 mandatory rule).
- DB migrations for all four contexts created in this increment so subsequent increments can add tables without DDL conflicts.
- Composition root wiring: `WeeklySelectionSyncService` port wired (even if implementation is a no-op stub) so Catalog increment can depend on it.

---

### Increment 2 — Catalog: Products, Diets, and Seeding (11 stories)

**Scope:** The shared product and diet catalog — the upstream reference data that everything else reads. Includes the OpenFoodFacts seed import. No recipe import in this increment.

**Components:** COMP-001 (Product Catalog Service), COMP-002 (Dietary Tagging Service), COMP-005 (OpenFoodFacts Import ACL), COMP-006 (Catalog Read Repository), COMP-007 (WeeklySelectionSyncService Port), COMP-008 (Catalog DB — full schema)

**Stories:**
- US-PA-001 Browse products with nutrition breakdown
- US-PA-002 Filter products by category
- US-PA-003 Search for a product
- US-PA-004 Product browsing matches reference pattern
- US-PA-005 Add a custom product
- US-PA-006 Edit or delete own products only
- US-PA-007 Mark product for the current week
- US-DA-001 View supported diets
- US-DA-002 Read diet description and macros guidance
- US-DA-003 Mark product compatibility with a diet

**Requirements delivered:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006 (product side), FR-007, FR-008, NFR-002, NFR-003, CON-003

**Key implementation notes:**
- OpenFoodFacts seed import (COMP-005) runs as a CLI import job at deployment. Filter: all four core macro fields populated.
- `CatalogReadRepository` (COMP-006) is the only interface CTX-003 and CTX-004 use to read nutritional data — no direct table joins outside this interface (ADR-0007).
- `WeeklySelectionSyncService` port (COMP-007) must be wired at composition root before this increment ships; the Meal Planning implementation (COMP-019) can remain a stub until Increment 4.
- Ownership enforcement (INV-002) must pass NFR-002 gate: zero exceptions.

---

### Increment 3 — Recipes and Nutrition Tracking (14 stories)

**Scope:** Recipe catalog (manual creation, browse, filter, favorites, week marking) and daily meal logging with nutrition aggregation. Recipe import (AI) is included here because it depends on the product catalog from Increment 2.

**Components:** COMP-003 (Recipe Management Service), COMP-004 (Recipe Import ACL), COMP-015 (Meal Log Service), COMP-016 (Daily Nutrition Aggregator), COMP-017 (Nutrition Tracking DB — full schema), COMP-008 (Catalog DB — recipe tables added)

**Stories:**
- US-RA-001 Browse recipes with nutrition and ingredients
- US-RA-002 Recipe list layout reference
- US-RA-003 Filter recipes by category
- US-RA-004 Filter favorites or my recipes
- US-RA-005 Filter recipes by diet
- US-RA-006 Search for a recipe
- US-RA-007 Mark recipe as favorite
- US-RA-008 Mark recipe for the current week
- US-RA-009 Add a recipe manually
- US-RA-010 Import a recipe from external sources
- US-RA-011 Open recipe card with full summary
- US-RA-012 Edit or delete own recipes
- US-RA-013 Edit recipe ingredients
- US-DA-004 Mark recipe compatibility with a diet
- US-PC-006 Log meals and see daily nutrition summary

**Requirements delivered:** FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-026, NFR-002 (recipe side), CON-005

**Key implementation notes:**
- Recipe import (COMP-004) calls GPT-4o with structured outputs (ADR-0002). DEC-003 (sync vs. async import pattern) is open and non-blocking; the team should decide before shipping US-RA-010 — HTTP 202 + polling is the safer default for a ~10-second OpenAI call.
- `RecipeNutritionRecalculatedOnIngredientChange` (POL-003) must fire on every `UpdateRecipe` that touches ingredient lines.
- Nutrition aggregator (COMP-016) reads calorie corridor from JWT claims — no Identity module call (ADR-0006).
- `DailyNutritionSummaryRecalculatedOnLogChange` (POL-005) must be tested: add, update, and delete log entry each trigger a recomputation.

---

### Increment 4 — Meal Planning and Shopping List (13 stories)

**Scope:** The weekly planning canvas, day cards, summary pool (including weekly-selection sync from Catalog), and shopping list generation. This is the most complex increment due to the multi-aggregate interaction and cross-context integration.

**Components:** COMP-018 (Meal Plan Service), COMP-019 (WeeklySelectionSyncService Impl), COMP-020 (Day Scheduling Service), COMP-021 (Shopping List Service), COMP-022 (Planning DB — full schema)

**Stories:**
- US-MP-001 Choose planning date range
- US-MP-002 See one card per day and a meal-prep summary
- US-MP-003 Weekly selections feed the summary
- US-MP-004 Build summary with drag-and-drop or equivalent
- US-MP-005 Organize summary into menu sections
- US-MP-006 Configure sections on day cards
- US-MP-007 Place items from summary onto days without removing from summary
- US-MP-008 Reorder across days and sections
- US-MP-009 Select items without drag-and-drop
- US-MP-010 Remove items from day cards and sync summary
- US-MP-011 Set servings per dish on a day
- US-MP-012 Day card nutrition summary
- US-MP-013 Generate or refresh shopping list from plan

**Requirements delivered:** FR-027, FR-028, FR-029, FR-030, FR-031, FR-032, FR-033, FR-034, FR-035, FR-036, CON-004

**Key implementation notes:**
- Wire `WeeklySelectionSyncService` Impl (COMP-019) at composition root now. The port from Increment 2 was a stub — replace with the real implementation that triggers `AddItemToSummary` for active plans (POL-002, ADR-0005).
- INV-012 (item in pool before day assignment) and INV-013 (summary cleanup via POL-001) are the two invariants most likely to have edge-case bugs — prioritize acceptance test coverage for US-MP-010.
- Shopping list (COMP-021) uses `CatalogReadRepository` (COMP-006) to resolve product quantities from ingredient lines (ADR-0007, INV-016).
- POL-004 (shopping list goes stale on plan changes) should be implemented as a staleness flag + explicit refresh rather than auto-refresh to keep the UX predictable.
- Per-day nutrition aggregation (FR-035) reads product/recipe data via `CatalogReadRepository` — consistent with ADR-0007, no data duplication.

---

## Open decisions affecting implementation

| DEC   | Question | Status | Affects |
|-------|----------|--------|---------|
| DEC-003 | Recipe import: synchronous vs. async (job + polling/SSE)? | Open | Increment 3 / US-RA-010 |
| DEC-004 | Nutritionist role: same permissions as User or elevated in MVP1? | Open | All increments (authz model) |
| DEC-008 | Identity: provider-agnostic abstraction now vs. defer until social login added? | Open | Increment 1 / COMP-013 |

DEC-003 and DEC-004 should be resolved before Increment 3 begins. DEC-008 should be resolved in Increment 1.

---

## Diagram locations

| File | Description |
|------|-------------|
| `c4/context.puml` | C4 L1: system context — 2 actors, 3 external systems |
| `c4/containers.puml` | C4 L2: MVP1 monolith, shared PostgreSQL, 3 external systems |
| `c4/components-catalog.puml` | C4 L3: CTX-001 Catalog (8 components) |
| `c4/components-identity.puml` | C4 L3: CTX-002 Identity (6 components) |
| `c4/components-nutrition.puml` | C4 L3: CTX-003 Nutrition Tracking (3 components) |
| `c4/components-planning.puml` | C4 L3: CTX-004 Meal Planning (5 components) |

Render with: `plantuml meta/architecture/c4/*.puml` (requires PlantUML CLI with bundled C4 stdlib).
