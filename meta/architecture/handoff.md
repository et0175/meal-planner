# Architecture Handoff — Meal Forge MVP1 Core Loop

**Generated:** 2026-06-22  
**Tier:** large  
**Pipeline:** brainstorm → domain-extraction → capability-mapping → context-mapping → decision-surfacing → adr-writer (×10) → synthesis ✅

---

## Artifact summary

| Artifact | Count |
|----------|-------|
| User stories (v1) | 54 (US-001–US-054) |
| Functional requirements | 36 (FR-001–FR-036) |
| Non-functional requirements | 15 (NFR-001–NFR-015) + 1 pending (NFR-016 large-text contrast, ADR-0010) |
| Constraints | 6 (CON-001–CON-006) |
| Acceptance criteria | 121 |
| Domain events | 23 |
| Domain commands | 23 |
| Aggregates | 5 |
| Policies | 6 |
| External systems | 2 |
| Bounded contexts | 6 (CTX-001–CTX-006; CTX-006 is stub) |
| Components | 24 (COMP-001–COMP-024) |
| ADRs | 10 (ADR-0001–ADR-0010) |
| C4 diagrams | 6 (L1 context, L2 containers, L3 × 4 contexts) |

---

## Bounded contexts

| ID | Name | Components | Deployment |
|----|------|-----------|------------|
| CTX-001 | Identity | COMP-001–005 | Python service + PostgreSQL DB |
| CTX-002 | Navigation Shell | COMP-006–007 | Next.js frontend (no backend) |
| CTX-003 | Product Catalog | COMP-008–012 | Python service + PostgreSQL DB |
| CTX-004 | Meal Planning | COMP-013–019 | Python service + PostgreSQL DB |
| CTX-005 | Shopping List | COMP-020–023 | Python service + PostgreSQL DB |
| CTX-006 | Meal Tracking (stub) | COMP-024 | Stub table in CTX-004 DB (ADR-0001) |

---

## Key architectural decisions

| ADR | Topic | Decision |
|-----|-------|----------|
| ADR-0001 | Log-from-plan with deferred Personal Cabinet | Stub TrackingEntry table in CTX-004 DB |
| ADR-0002 | WeekFlag cross-context read | Sync REST query from CTX-004 → CTX-003 at render |
| ADR-0003 | Shopping List staleness | Check-on-read timestamp comparison |
| ADR-0004 | Topbar week-stats | Dedicated GET /plan/summary endpoint |
| ADR-0005 | Password reset expiry | 1-hour token window |
| ADR-0006 | Sign-in rate limiting | 10 attempts / 1-hour lockout |
| ADR-0007 | Shopping List default range | Current ISO week (Mon–Sun) |
| ADR-0008 | ShoppingList persistence | Single active list per user (upsert) |
| ADR-0009 | WeekFlag rollover | Auto-clear old flags on Monday promotion |
| ADR-0010 | WCAG large-text contrast | Explicit NFR metric (3:1 threshold) |

---

## Implementation plan — 4 increments

### Increment 1 — Foundation (Identity + Navigation Shell)
**Contexts:** CTX-001, CTX-002  
**Components:** COMP-001–007  
**Stories:** US-001–012 (Authentication + Navigation)  
**Key FRs:** FR-001–010 (auth flows, session, rate-limit, roles, navigation)  
**Tests:** TC-AUTH-*, TC-NAV-*  

Deliverables:
- Python Identity service: register, sign-in, sign-out, password reset, session management
- Rate-limiting (ADR-0006: 10 attempts / 1h), token expiry (ADR-0005: 1h)
- Next.js shell: sidebar navigation, topbar, auth guard, route protection
- Topbar week-stats widget shell (calls GET /plan/summary — returns empty until Increment 3)

Gate: unauthenticated access redirects to sign-in; session persists within tab; all TC-AUTH pass.

---

### Increment 2 — Product Catalog
**Contexts:** CTX-003  
**Components:** COMP-008–012  
**Stories:** US-013–024 (Products Database)  
**Key FRs:** FR-011–020 (catalog browse, search/filter, add/edit/delete, week flags, units)  
**Key NFRs:** NFR-002 (search < 200ms), NFR-010–011 (data limits)  
**Tests:** TC-PRD-*  

Deliverables:
- Python Product Catalog service: CRUD products, category management, unit definitions
- Week flag endpoints (GET /products?week_flag=this_week&user_id=…) per ADR-0002
- Scheduler hook for Monday flag rollover (ADR-0009: auto-clear + promote)
- Next.js: category cards view, list view, search/filter, product detail modal, add/edit form

Gate: search returns in < 200ms at 1,000 products; week flags persist and promote correctly on rollover.

---

### Increment 3 — Meal Planning
**Contexts:** CTX-004, CTX-006 (stub)  
**Components:** COMP-013–019, COMP-024  
**Stories:** US-025–047 (Meal Planner)  
**Key FRs:** FR-021–036 (assignments, slots, drag-and-drop, log-from-plan, PDF, nutrition targets)  
**Key NFRs:** NFR-003 (shopping list gen < 500ms), NFR-004 (PDF < 3s)  
**Tests:** TC-PLN-*, TC-CAL-*  

Deliverables:
- Python Meal Planning service: assignment CRUD, week navigation, nutrition aggregation
- GET /plan/summary endpoint (ADR-0004: topbar widget)
- Stub TrackingEntry table (ADR-0001) + write endpoints for log-from-plan
- PDF export (Week summary)
- Next.js: Week summary grid, Calendar views (day/4-day/week/month), drag-and-drop, log actions

Gate: week plan round-trips correctly; log-from-plan writes to stub table; PDF downloads within 3s; topbar stats update reactively.

---

### Increment 4 — Shopping List
**Contexts:** CTX-005  
**Components:** COMP-020–023  
**Stories:** US-048–054 (Shopping List)  
**Key FRs:** FR-027–031 (generation, date range, staleness, category grouping, PDF)  
**Key NFRs:** NFR-003 (generation < 500ms for 31 days)  
**Tests:** TC-SHP-*  

Deliverables:
- Python Shopping List service: grocery list derivation, category aggregation, staleness detection (ADR-0003)
- Date range picker defaulting to current ISO week (ADR-0007)
- Single active list per user upsert model (ADR-0008)
- PDF export (grocery list with category groupings)
- Next.js: Shopping List view, plan summary panel, stale indicator + refresh

Gate: list generates in < 500ms for a fully planned 2-week range; stale indicator appears on plan change; PDF downloads correctly with empty categories omitted.

---

## Deferred to v1.1

From `meta/kanban/backlog.md` (5 modules + 2 UX candidates):
- Products Analyser module (US-PAN-001–009)
- Dietary Analyser module (US-DA-001–005)
- Recipe Analyser module (US-RA-001–015)
- Personal Cabinet module (US-PC-001–010) — will own the stub TrackingEntry table
- Advanced Search module (US-AS-001–014; OQ-009 AND+OR, OQ-010 per-100g toggle, both resolved)
- Shopping List "Next week" quick-select (ADR-0007)
- "Repeat every week" staple flag (ADR-0009)

---

## Open validator findings (expected, not blocking)

- **51 WARNs:** All requirements have `status: partial` — planned test names exist but no green tests yet. Normal greenfield state; implementing team confirms test names as they pass.
- **24 INFOs:** All components have planned code globs but no `_meta.as_built` — expected, no code written yet.

---

## Next step

Run `/forge:kanban` to decompose these 4 increments into Kanban cards with full architectural context for the implementation agents.
