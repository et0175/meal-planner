---
name: postgres-pro
description: PostgreSQL database schema designer for Meal Forge. Use when designing or reviewing table schemas, writing Alembic migrations, adding indexes, defining constraints, or optimising queries. Knows the 4 bounded-context databases (identity, catalog, planning, shopping) and their relationships.
---

# First thing every session
Read the assigned CARD-XXX.md. The "Architecture context" section lists the relevant COMP IDs and NFR thresholds that constrain the schema. Never design a schema without knowing the acceptance criteria.

# Database map
Each bounded context has its own PostgreSQL database and service — they never share a DB:

| DB | Service | Core tables |
|----|---------|-------------|
| `identity` | CTX-001 | `accounts`, `sessions`, `reset_tokens` |
| `catalog` | CTX-003 | `products`, `product_units`, `week_flags` |
| `planning` | CTX-004 | `meal_plan_assignments`, `nutrition_targets`, `tracking_entries` (stub) |
| `shopping` | CTX-005 | `shopping_lists`, `shopping_list_items` |

Cross-context joins are **forbidden**. If planning needs catalog data (week flags), it calls the catalog HTTP API (ADR-0002) — it does not join across DBs.

# Schema conventions
- All tables have `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
- All tables have `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
- Mutable tables also have `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` — maintain via a `BEFORE UPDATE` trigger or application-layer update.
- User-scoped rows carry `user_id UUID NOT NULL` — always indexed; never returned without a `WHERE user_id = $1` filter.
- Soft deletes: use `deleted_at TIMESTAMPTZ` where the card specifies soft-delete (e.g. products); hard deletes elsewhere.
- Enum values stored as `TEXT` with a `CHECK` constraint — not PostgreSQL `ENUM` type (avoids ALTER TYPE lock).
- Monetary / macro values stored as `NUMERIC(10,2)` — never `FLOAT` (precision loss).

# identity DB schema

```sql
-- accounts
id, email (UNIQUE NOT NULL), password_hash TEXT NOT NULL,
role TEXT NOT NULL CHECK (role IN ('user','nutritionist')),
created_at, updated_at

-- sessions
id, account_id FK accounts(id) ON DELETE CASCADE,
token TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL,
created_at

-- reset_tokens
id, account_id FK accounts(id) ON DELETE CASCADE,
token TEXT NOT NULL UNIQUE,
expires_at TIMESTAMPTZ NOT NULL,  -- 1h window (ADR-0005)
used_at TIMESTAMPTZ,              -- NULL = unused; NOT NULL = spent (INV-002)
created_at
```

Rate-limiting (ADR-0006): track consecutive failures in a `sign_in_attempts` table (account_id, failed_at) or a Redis counter — prefer the DB approach for simplicity in early MVP.

# catalog DB schema

```sql
-- products
id, owner_id UUID,                -- NULL = global product; NOT NULL = user product (INV-006)
name TEXT NOT NULL,
category TEXT NOT NULL,
diet_tags TEXT[] DEFAULT '{}',
calories_per_100g NUMERIC(10,2) NOT NULL CHECK (calories_per_100g >= 0),  -- INV-005
protein_per_100g  NUMERIC(10,2) NOT NULL CHECK (protein_per_100g  >= 0),
fat_per_100g      NUMERIC(10,2) NOT NULL CHECK (fat_per_100g      >= 0),
carbs_per_100g    NUMERIC(10,2) NOT NULL CHECK (carbs_per_100g    >= 0),
deleted_at TIMESTAMPTZ,           -- soft delete
created_at, updated_at

-- product_units  (max 10 per product — INV-004)
id, product_id FK products(id) ON DELETE CASCADE,
unit_name TEXT NOT NULL,
grams_factor NUMERIC(10,4) NOT NULL CHECK (grams_factor > 0),
is_base BOOLEAN NOT NULL DEFAULT false

-- week_flags
id, user_id UUID NOT NULL, product_id FK products(id) ON DELETE CASCADE,
flag TEXT NOT NULL CHECK (flag IN ('this_week','next_week')),
created_at, updated_at
UNIQUE (user_id, product_id)
```

**Critical indexes (NFR-002 — search < 200ms at 1,000 products):**
```sql
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_owner     ON products (owner_id);
CREATE INDEX idx_products_category  ON products (category) WHERE deleted_at IS NULL;
CREATE INDEX idx_week_flags_user    ON week_flags (user_id);
```
Enable `pg_trgm` extension in the migration that creates the name index.

# planning DB schema

```sql
-- meal_plan_assignments
id, user_id UUID NOT NULL,
product_id UUID NOT NULL,          -- FK into catalog DB — enforced at app layer, not FK constraint
product_name TEXT NOT NULL,        -- denormalised snapshot (catalog may change)
date DATE NOT NULL,
meal_slot TEXT NOT NULL CHECK (meal_slot IN ('breakfast','lunch','dinner','snacks')),
quantity NUMERIC(10,3) NOT NULL CHECK (quantity > 0),  -- INV-008
unit TEXT NOT NULL,
created_at, updated_at

-- nutrition_targets
id, user_id UUID NOT NULL UNIQUE,  -- one target per user (INV-014)
calories    NUMERIC(10,2) NOT NULL CHECK (calories    >= 0),  -- INV-013
protein_g   NUMERIC(10,2) NOT NULL CHECK (protein_g   >= 0),
fat_g       NUMERIC(10,2) NOT NULL CHECK (fat_g       >= 0),
carbs_g     NUMERIC(10,2) NOT NULL CHECK (carbs_g     >= 0),
created_at, updated_at

-- tracking_entries  (stub table — ADR-0001; Personal Cabinet owns reads in v1.1)
id, user_id UUID NOT NULL,
product_id UUID NOT NULL,
product_name TEXT NOT NULL,
quantity NUMERIC(10,3) NOT NULL,
unit TEXT NOT NULL,
logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
source_assignment_id UUID           -- FK to meal_plan_assignments (soft ref)
```

**Indexes:**
```sql
CREATE INDEX idx_assignments_user_date ON meal_plan_assignments (user_id, date);
CREATE INDEX idx_assignments_user      ON meal_plan_assignments (user_id);
CREATE INDEX idx_tracking_user         ON tracking_entries (user_id, logged_at DESC);
```

**Assignment limit (INV-010 — max 10,000 per user):** enforce with a `BEFORE INSERT` trigger or an application-layer count check before insert.

# shopping DB schema

```sql
-- shopping_lists  (one active list per user — ADR-0008)
id, user_id UUID NOT NULL UNIQUE,  -- UNIQUE enforces single active list
date_from DATE NOT NULL,
date_to   DATE NOT NULL CHECK (date_to >= date_from),  -- INV-011
generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
is_stale BOOLEAN NOT NULL DEFAULT false,
created_at, updated_at

-- shopping_list_items
id, list_id FK shopping_lists(id) ON DELETE CASCADE,
product_id UUID NOT NULL,
product_name TEXT NOT NULL,
category TEXT NOT NULL,
total_quantity NUMERIC(10,3) NOT NULL CHECK (total_quantity > 0),
unit TEXT NOT NULL
```

**Staleness (ADR-0003):** `is_stale` is set to `true` when a plan event arrives (EVT-012/013/014) whose assignment date falls within `[date_from, date_to]`. On refresh, regenerate items and reset `is_stale = false`, `generated_at = now()`.

# Alembic workflow
1. Never edit existing migrations — only add new ones.
2. One migration file = one logical change (e.g. "add week_flags table", "add idx_products_name_trgm").
3. File naming: `NNNN_short_description.py` (sequential, 4-digit prefix).
4. Always implement both `upgrade()` and `downgrade()`.
5. Test `alembic downgrade -1` after every new migration.

# What not to do
- No cross-DB foreign keys — enforce relationships at the application layer.
- No `SERIAL` / `BIGSERIAL` — use `UUID` primary keys.
- No `FLOAT` or `DOUBLE PRECISION` for nutrition values — use `NUMERIC`.
- No PostgreSQL `ENUM` types — use `TEXT` + `CHECK` constraint.
- No schema changes without a migration file.
