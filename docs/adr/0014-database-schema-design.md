# ADR-0014: Database Schema Design — Four Bounded-Context Databases

**Date**: 2026-07-24  
**Status**: Accepted  
**Deciders**: Meal Forge Architecture Team

## Context

Meal Forge is a microservices architecture with four independent bounded contexts, each owning its data:
1. **Identity** — account lifecycle and session management
2. **Catalog** — product definitions and nutrition data
3. **Planning** — meal plan assignments and tracking
4. **Shopping** — shopping list generation and management

Each service runs its own PostgreSQL database (separate in production, SQLite in-memory for tests) to enforce strong data isolation and allow independent scaling.

## Decision

Maintain **four independent databases**, one per microservice, with the following design principles:

### 1. Identity Database
**Purpose**: Account lifecycle, authentication, session management.

**Tables**:
- `accounts` — user account credentials and account status
  - `id` (PK), `email` (unique), `password_hash`, `role` (enum: user, nutritionist), `failed_sign_in_count`, `locked_until`, `created_at`
  - Rate limiting: 10 failed attempts → 1h lockout
  - Soft-lock via `locked_until` column, not account deletion

- `sessions` — active Bearer tokens for API calls
  - `id` (PK), `account_id` (FK → accounts), `token` (unique), `is_valid`, `created_at`, `expires_at`
  - Invalidated en masse on password reset
  - Other services validate by calling `GET /auth/session` (HTTP), not importing this DB

- `reset_tokens` — one-time password reset links
  - `id` (PK), `account_id` (FK → accounts), `token` (unique), `is_used`, `expires_at`, `created_at`
  - Single-use atomic mark to prevent TOCTOU races
  - 1-hour expiry

**Key decisions**:
- No cross-service imports; token validation is HTTP-only
- Role is always `user` at registration (never caller-controlled)
- Soft-locking and invalidation-by-token, not row deletion

---

### 2. Catalog Database
**Purpose**: Product definitions, nutrition data, user-created products, and week-flag tracking.

**Tables**:
- `products` — canonical product records (global or user-owned)
  - `id` (PK), `owner_id` (NULL for globals), `name`, `category`, `diet_tags` (JSON), `source` (for USDA imports), `external_id`, `is_deleted`, `created_at`
  - Global products: `owner_id = NULL`, immutable by any user (403 on edit/delete)
  - User products: `owner_id = user_id`, only owner can edit/delete
  - Soft-delete: `is_deleted = true`; all queries filter it out
  - Bulk import from USDA FoodData Central via `(source, external_id)` unique key for idempotent upsert

- `product_units` — conversion factors for a product
  - `id` (PK), `product_id` (FK), `unit_name`, `grams_per_unit`
  - Max 10 units per product (enforced in service layer)
  - Canonical base unit: 100g

- `nutrition_per_100g` — macronutrients standardized to 100g
  - `id` (PK), `product_id` (FK, unique), `calories`, `protein_g`, `fat_g`, `carbs_g`
  - One row per product; denormalized for fast queries
  - Missing macros default to 0.0; missing energy is derived from macros (Atwater factors: 4·protein + 9·fat + 4·carbs)

- `product_translations` — per-locale product names (ADR-0012)
  - `id` (PK), `product_id` (FK), `locale`, `name`
  - Unique constraint: `(product_id, locale)`
  - `products.name` is canonical English; fallback if translation missing
  - Per-locale trigram GIN index for ILIKE search at scale (10k+ products/language)

- `week_flags` — user's shopping intent for next two weeks (ADR-0002)
  - `id` (PK), `product_id` (FK), `user_id`, `flag` (enum: this_week, next_week, none), `updated_at`
  - Unique constraint: `(product_id, user_id)` — one row per user-product pair
  - Upsert pattern in service layer
  - Monday 00:00 UTC rollover: `this_week → next_week` (planning service reads this via API)

**Key decisions**:
- Owner-based authorization: null `owner_id` = global/immutable
- Soft-delete for audit trail
- Inline nutrition (no runtime joins to other services)
- Per-locale translations + trigram search for NFR-002 (< 200ms search at 10k products)
- USDA import via `(source, external_id)` unique key

---

### 3. Planning Database
**Purpose**: Meal plan assignments, nutrition targets, and activity tracking.

**Tables**:
- `meal_plan_assignments` — individual meal assignment to a product
  - `id` (PK), `user_id`, `product_id`, `product_name`, `date`, `meal_slot` (enum: breakfast, lunch, dinner, snacks), `quantity`, `unit`
  - Denormalized nutrition: `kcal_per_unit`, `protein_g_per_unit`, `fat_g_per_unit`, `carbs_g_per_unit` (nullable, populated at creation time)
  - Compound index on `(user_id, date)` for weekly queries
  - Max 10,000 assignments per user (enforced in service layer)
  - No FK to Catalog; product_id is retained for reference but not enforced

- `nutrition_targets` — weekly nutrition goals per user
  - `id` (PK), `user_id` (unique), `target_calories`, `protein_g`, `fat_g`, `carbs_g`, `created_at`, `updated_at`
  - Upsert pattern: one target per user
  - Nullable columns allow incremental target setting

- `tracking_entries` — activity log (write-only, ADR-0001)
  - `id` (PK), `user_id`, `product_id`, `product_name`, `quantity`, `unit`, `logged_at`, `source_assignment_id`
  - Stub table for future v1.1 analytics; currently write-only from plan mutations
  - No read endpoints; purely append-only audit log

**Key decisions**:
- Denormalized nutrition fields: avoid runtime calls to Catalog for PDF/summary
- Denormalized product_name: avoid runtime calls to Catalog for rendering
- No FK to Catalog or Identity (loose coupling, graceful degradation)
- Inline totals in summary responses (no windowed aggregate functions)

---

### 4. Shopping List Database
**Purpose**: Shopping list generation from meal plans.

**Tables**:
- `shopping_lists` — active list per user
  - `id` (PK), `user_id` (unique), `from_date`, `to_date`, `is_stale`, `generated_at`
  - One active list per user (unique constraint on `user_id`)
  - Staleness flag: set when plan changes (ADR-0003); cleared on generate/refresh
  - Date range captures the week covered

- `shopping_list_items` — aggregated product rows
  - `id` (PK), `list_id` (FK), `product_id`, `product_name`, `category` (nullable, fetched from Catalog), `total_quantity`, `unit`
  - Aggregation key: `(product_id, unit)` — same product in different units is separate rows
  - No FK to products; product_id retained for reference
  - Category fetched on-demand from Catalog (best-effort, tolerates outage)

**Key decisions**:
- Single active list per user: replace on each generate, not append
- Staleness tracking: avoids redundant regeneration
- Aggregation by `(product_id, unit)`: different units remain separate
- Best-effort category enrichment: graceful fallback to `NULL`

---

## Cross-Service Data Access

### Read-Only HTTP APIs (No Imports)
- **Identity** ← all services: `GET /auth/session` to validate Bearer tokens
- **Catalog** ← Planning: week flags, product search; Shopping: category enrichment
- **Planning** ← Shopping: meal assignments to aggregate into shopping list

### Forward Compatibility
- All services **only read** from other services via HTTP
- No `FOREIGN KEY` constraints across services (loose coupling)
- Missing/stale data falls back gracefully (e.g., Shopping with no Catalog response uses `category = NULL`)

---

## Testing Strategy

**In-memory SQLite**: Each service uses `sqlite+aiosqlite:///:memory:` in tests. Migrations run with `alembic upgrade head` in the test session. Tests override the `verify_token` dependency to inject mock authentication.

---

## Constraints & Invariants

| Constraint | Service | Enforcement |
|-----------|---------|-------------|
| INV-004: ≤ 10 units/product | Catalog | Service layer on create/update |
| INV-010: ≤ 10,000 assignments/user | Planning | `func.count` in DB before insert |
| INV-011: from_date ≤ to_date | Shopping | Pydantic `model_validator` → 422 |
| INV-012: List staleness within range | Shopping | Service layer before flag set |
| INV-014: One target/user | Planning | DB unique constraint |
| NFR-002: Search p95 < 200ms @ 10k products | Catalog | Per-locale trigram GIN indexes |
| NFR-003: Shopping list < 500ms @ 31 days | Shopping | Concurrent API calls + aggregation |
| NFR-004: PDF export < 3s | Planning / Shopping | reportlab (pure-Python, in-memory) |

---

## Future Evolution

1. **Event Bus**: Currently Shopping marks staleness via HTTP stub; future event-driven architecture will replace `POST /shopping/events/plan-changed`
2. **Read Replicas**: Identity service may add read-heavy replica for session validation (currently single-writer)
3. **Cross-Service Transactions**: If needed, implement saga pattern (not direct ACID transactions)
4. **Audit Log**: Central table in all services for regulatory/support use

---

## References
- ADR-0002: Week flag design
- ADR-0003: Shopping list staleness
- ADR-0005: Reset token TOCTOU safety
- ADR-0006: Rate limiting policy
- ADR-0008: Single active list per user
- ADR-0012: Product localization
- ADR-0013: USDA bulk import
