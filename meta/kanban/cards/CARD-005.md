# CARD-005: Meal Planning service (Python)

**Status:** in_progress
**Priority:** P1
**Category:** feature
**Estimate:** 6d
**Revision pending:** false
**Skill:** python-pro
**TDD:** —
**Branch:** card/005-meal-planning-service
**Worktree:** ../project-CARD-005
**Source:** meta/architecture/handoff.md#increment-3
**Depends on:** CARD-003
**Review score:** —
**Started:** 2026-06-29T00:00:00Z
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Python Meal Planning service (CTX-004, COMP-013–019; CTX-006 stub, COMP-024):

**Plan assignment CRUD (COMP-013):**
- `GET /plan?week=YYYY-WW&user_id=…` — list assignments for a week; assignments are user-scoped (INV-009)
- `POST /plan/assignments` — add assignment (product, date, meal slot, quantity, unit); reject quantity = 0 (422, INV-008); reject > 10,000 total assignments (409, INV-010); emit EVT-011
- `PUT /plan/assignments/:id` — update quantity/unit; emit EVT-012
- `DELETE /plan/assignments/:id` — remove assignment; emit EVT-013
- `PUT /plan/assignments/:id/move` — move to different date/slot; emit EVT-014

**Week navigation:** support ISO-week parameter on all read endpoints

**This-week flagged products (COMP-015):**
- On `GET /plan?week=current`, also include products flagged "This week" by the user via sync REST call to Catalog service (ADR-0002: `GET /products?week_flag=this_week&user_id=…`)

**Nutrition targets (COMP-014):**
- `GET /plan/target` / `PUT /plan/target` — user's daily calorie/macro corridor; user-scoped (INV-014); reject negative calories (422, INV-013)

**Plan summary endpoint (COMP-017, ADR-0004):**
- `GET /plan/summary?week=YYYY-WW` — returns total kcal, protein, fat, carbs for the week; used by topbar widget

**Item search (COMP-013):**
- `GET /plan/search?q=…` — returns products sorted: recently used first, then user-owned, then alphabetical

**Log-from-plan (COMP-016, ADR-0001):**
- `POST /plan/log/day` — create TrackingEntries for all assignments on a date; emit EVT-015
- `POST /plan/log/week` — create TrackingEntries for all assignments in a week; emit EVT-016
- `POST /plan/log/item` — create a single TrackingEntry from one assignment; emit EVT-017

**Stub TrackingEntry table (COMP-024, ADR-0001):**
- `tracking_entries` table in CTX-004 DB with columns: id, user_id, product_id, quantity, unit, logged_at, source_assignment_id
- Write endpoints only; read/UI deferred to Personal Cabinet (v1.1)

**PDF export (COMP-018):**
- `POST /plan/export/pdf` — generate PDF of the current week's meal plan; emit EVT-018; must complete in < 3 s (NFR-004)

**PostgreSQL schema (COMP-019):**
- `meal_plan_assignments`, `nutrition_targets`, `tracking_entries` tables + migrations

Gate: week plan round-trips correctly; log-from-plan writes to stub table; PDF downloads within 3 s; topbar stats update reactively.

## Acceptance criteria

**FR-016 — Week navigation**
- AC-046: click "Next week" → following week's assignments loaded
- AC-047: click "Today" → returns to current week
- AC-113: current week already active → "Today" button highlighted

**FR-017 — Week Summary grid**
- AC-048: 3 Monday Breakfast assignments → grid shows all 3 with day columns
- AC-049: add row (quantity 2 servings) → EVT-011 emitted, row appears
- AC-050: remove row → EVT-013 emitted, row gone
- AC-051: toggle to grams → EVT-012 emitted
- AC-101: quantity = 0 → 422 (INV-008)
- AC-102: Alice's assignments not visible to Bob (INV-009)

**FR-018 — This-week flagged products**
- AC-052: "This week" flagged product → appears in Week Summary without manual add
- AC-114: "Next week" flagged product → not shown in current week

**FR-019 — Calendar meal slots**
- AC-053: Calendar tab → items grouped under Breakfast / Lunch / Dinner / Snacks
- AC-054: add to Tuesday Dinner → EVT-011 emitted
- AC-055: drag from Monday Lunch to Wednesday Dinner → EVT-014 emitted
- AC-056: increase servings → EVT-012 emitted
- AC-115: set servings to 0 → 422 (INV-008)

**FR-020 — Calendar layouts**
- AC-057: switch to single-day layout → only selected day shown
- AC-116: empty day in single layout → empty state per slot (no error)

**FR-021 — Plan Summary Panel**
- AC-058: Calendar tab → summary panel shows items grouped by slot
- AC-059: add item via summary panel → EVT-011 emitted
- AC-117: no assignments → panel shows empty slot sections (no error)

**FR-022 — Diet label**
- AC-060: diet preference "Keto" set → label shown in planner header
- AC-061: no diet preference → no label (no error)

**FR-023 — Item search order**
- AC-062: type "oa" → recently used first, owned second, alphabetical rest
- AC-121: no history → alphabetical

**FR-024 — Nutrition indicators**
- AC-063: 1600 kcal / 2000 target → 80% indicator on Tuesday
- AC-064: no target set → no indicators (no error)
- AC-106: target calories = -100 → 422 (INV-013)
- AC-107: Alice's target not visible to Bob (INV-014)

**FR-025 — Log from plan (ADR-0001)**
- AC-065: "Log this day" (5 assignments) → EVT-015 + 5 TrackingEntries
- AC-066: "Log this week" (20 assignments) → EVT-016 + 20 TrackingEntries
- AC-067: log single Calendar item → EVT-017 + 1 TrackingEntry
- AC-118: empty day → EVT-015 + 0 TrackingEntries (no error)

**FR-026 — PDF export (NFR-004)**
- AC-068: export PDF with assignments → EVT-018 + print dialog within 3 s
- AC-069: empty week → empty-plan PDF generated (no error)

**FR-033 — Assignment limit**
- AC-079: 10,001st assignment → 409 (INV-010)

## Architecture context

- **FR:** FR-016–FR-026, FR-033
- **NFR:** NFR-003 (shopping list gen < 500ms — see CARD-007), NFR-004 (PDF < 3s), NFR-009 (assignments data limit)
- **ADR:** ADR-0001 (stub TrackingEntry table), ADR-0002 (sync REST call to Catalog for week flags), ADR-0004 (GET /plan/summary for topbar)
- **Components:** COMP-013 (MealPlanService), COMP-014 (NutritionTargetService), COMP-015 (WeekFlagReader), COMP-016 (LogFromPlanService), COMP-017 (PlanSummaryService), COMP-018 (MealPlanPdfExport), COMP-019 (PlanningDB), COMP-024 (TrackingEntryStub)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

Implementation complete on branch `card/005-meal-planning-service`.

**What was built:**
- `db/models.py` — MealPlanAssignment, NutritionTarget, TrackingEntry ORM models
- `db/engine.py` — AsyncEngine/AsyncSession factory (same pattern as catalog)
- `db/migrations/versions/0001_initial_schema.py` — full Alembic migration
- `auth_middleware.py` — verify_token via Identity service (identical pattern to catalog)
- `mealplan/` — assignment CRUD, week plan view, item search (FR-016–019, FR-023, FR-033)
- `target/` — GET/PUT nutrition targets (FR-024, INV-013, INV-014)
- `summary/` — GET /plan/summary for topbar widget (COMP-017, ADR-0004)
- `logplan/` — log-from-plan (FR-025, ADR-0001): log/day, log/week, log/item
- `pdf/` — reportlab PDF export (FR-026, NFR-004 < 3 s verified in tests)
- `weekflag_reader/service.py` — HTTP client for Catalog week flags + product search (ADR-0002)
- 56 tests, all green

**Key decisions:**
- Renamed log-from-plan package to `logplan/` (not `logging/`) — the stub `logging/__init__.py` shadowed stdlib `logging` and broke pytest; removed the stub.
- Inline nutrition fields on assignments (kcal_per_unit etc.) for PDF/summary without runtime Catalog calls.
- product_name denormalized into assignments for PDF rendering (NFR-004 compliance).
- Week-flagged products only fetched for current ISO week (ADR-0002 / AC-052, AC-114).

**NFR gates verified:**
- NFR-004: PDF < 3 s confirmed by `test_export_pdf_within_3_seconds` (50 assignments, elapsed well under limit)
- INV-008/010/013/014: all invariants covered by parametrized property tests
