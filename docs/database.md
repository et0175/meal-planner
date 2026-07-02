# Database Structure

Meal Forge uses four isolated PostgreSQL 16 databases — one per backend service. Services never share a database; cross-service data is passed via HTTP at request time. `account_id` / `user_id` values are the only identifiers that cross boundaries (they originate in the Identity service and are carried by the Bearer token).

---

## Overview

| Database | Service | Port (local) | Tables |
|----------|---------|--------------|--------|
| `identity` | Identity | 15432 | `accounts`, `sessions`, `reset_tokens` |
| `catalog` | Catalog | 5436 | `products`, `product_translations`, `product_units`, `nutrition_per_100g`, `week_flags` |
| `planning` | Planning | 5434 | `meal_plan_assignments`, `nutrition_targets`, `tracking_entries` |
| `shopping` | Shopping | 5435 | `shopping_lists`, `shopping_list_items` |

---

## Identity database

Owns authentication state: accounts, active sessions, and password-reset tokens.

### `accounts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `email` | varchar(254) | NOT NULL, UNIQUE, indexed | |
| `password_hash` | varchar(128) | NOT NULL | bcrypt, min 10 rounds (NFR-006) |
| `role` | enum(`user`, `nutritionist`) | NOT NULL, default `user` | Always set to `user` at registration — never caller-controlled |
| `failed_sign_in_count` | integer | NOT NULL, default 0 | Incremented on each failed sign-in; reset on success |
| `locked_until` | timestamptz | nullable | Non-null while account is rate-limit locked (ADR-0006) |
| `created_at` | timestamptz | NOT NULL, server default `now()` | |

### `sessions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `account_id` | integer | NOT NULL, FK → `accounts.id` CASCADE, indexed | |
| `token` | varchar(128) | NOT NULL, UNIQUE, indexed | Opaque random token, 256-bit entropy |
| `is_valid` | boolean | NOT NULL, default `true` | Set to `false` on sign-out or password reset |
| `created_at` | timestamptz | NOT NULL, server default `now()` | |
| `expires_at` | timestamptz | nullable | Currently unused; reserved for future sliding expiry |

All sessions for an account are invalidated (bulk `is_valid = false`) when a password reset is confirmed.

### `reset_tokens`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `account_id` | integer | NOT NULL, FK → `accounts.id` CASCADE, indexed | |
| `token` | varchar(128) | NOT NULL, UNIQUE, indexed | 256-bit urlsafe random (NFR-007) |
| `is_used` | boolean | NOT NULL, default `false` | Marked `true` atomically on first use (TOCTOU-safe, ADR-0005) |
| `expires_at` | timestamptz | NOT NULL | 1-hour TTL from creation |
| `created_at` | timestamptz | NOT NULL, server default `now()` | |

---

## Catalog database

Owns the product catalogue: product definitions, units, nutrition data, and per-user week-planning flags.

### `products`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `owner_id` | integer | nullable, indexed | `NULL` = global/shared product; non-null = user-owned. Only owner can edit/delete (INV-006) |
| `name` | varchar(255) | NOT NULL, indexed (`ix_products_name`) | Canonical/default-locale (English) name and fallback for `product_translations`. `pg_trgm` GIN index `ix_products_name_trgm` (PostgreSQL) supports NFR-002 ILIKE search |
| `category` | varchar(100) | NOT NULL | Free-text category label (vocab normalization deferred — see ADR-0012 phase notes) |
| `diet_tags` | JSON | NOT NULL, default `[]` | Array of strings. Stored as JSON for SQLite test compatibility |
| `is_deleted` | boolean | NOT NULL, default `false` | Soft-delete — hard deletes are never used |
| `created_at` | timestamptz | NOT NULL, server default `now()` | |

**Constraints:** max 500 user-owned products per user enforced in service layer (INV-007).

### `product_translations`

Per-locale product name (FR-037, ADR-0012). The catalog list/detail reads `LEFT JOIN` this table on the requested locale and `COALESCE` to `products.name` when no row exists.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `product_id` | integer | NOT NULL, FK → `products.id` CASCADE, indexed | |
| `locale` | varchar(10) | NOT NULL | BCP-47 tag, e.g. `en`, `de` (CON-007) |
| `name` | varchar(255) | NOT NULL | Localized product name |

**Constraints:** `UNIQUE (product_id, locale)` — one name per product per locale.
**Indexes:** `pg_trgm` GIN index `ix_product_translations_name_trgm` (PostgreSQL) for per-locale ILIKE search at 10k products per language (NFR-002/010).
**Scope (CON-007):** global products are translatable into all supported locales; user-added products carry one row in their creator's locale. English (`en`) is the default fallback.

### `product_units`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `product_id` | integer | NOT NULL, FK → `products.id` CASCADE, indexed | |
| `unit_name` | varchar(50) | NOT NULL | e.g. `g`, `ml`, `piece` |
| `grams_per_unit` | float | NOT NULL | Conversion factor for nutrition calculations |

**Constraints:** max 10 units per product enforced in service layer (INV-004).

### `nutrition_per_100g`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `product_id` | integer | NOT NULL, UNIQUE, FK → `products.id` CASCADE, indexed | One-to-one with `products` |
| `calories` | float | NOT NULL | kcal per 100 g |
| `protein_g` | float | NOT NULL | grams per 100 g |
| `fat_g` | float | NOT NULL | grams per 100 g |
| `carbs_g` | float | NOT NULL | grams per 100 g |

All values ≥ 0 enforced by Pydantic schema (INV-005).

### `week_flags`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `product_id` | integer | NOT NULL, FK → `products.id` CASCADE, indexed | |
| `user_id` | integer | NOT NULL, indexed | Carries the `account_id` from the Identity token |
| `flag` | enum(`this_week`, `next_week`, `none`) | NOT NULL, default `none` | |
| `updated_at` | timestamptz | NOT NULL, server default `now()`, auto-updated | Used for Monday rollover logic (ADR-0009) |

**Constraints:** `UNIQUE (product_id, user_id)` — one flag row per product per user.

**Rollover (ADR-0009):** Every Monday 00:00 UTC, APScheduler promotes `next_week → this_week` and clears stale `this_week` rows whose `updated_at` predates the rollover.

---

## Planning database

Owns meal plan assignments, per-user nutrition targets, and a write-only consumption log.

### `meal_plan_assignments`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `user_id` | integer | NOT NULL, indexed | |
| `product_id` | integer | NOT NULL, indexed | Logical FK to Catalog `products.id` — not enforced at DB level (cross-service) |
| `product_name` | varchar(255) | NOT NULL | Denormalised from Catalog to avoid a runtime call during PDF/summary |
| `date` | date | NOT NULL, indexed | ISO date of the assignment |
| `meal_slot` | enum(`breakfast`, `lunch`, `dinner`, `snacks`) | NOT NULL | |
| `quantity` | float | NOT NULL | Must be > 0 (INV-008) |
| `unit` | varchar(50) | NOT NULL | e.g. `g`, `piece` |
| `kcal_per_unit` | float | nullable | Denormalised from Catalog at assignment time |
| `protein_g_per_unit` | float | nullable | Denormalised from Catalog at assignment time |
| `fat_g_per_unit` | float | nullable | Denormalised from Catalog at assignment time |
| `carbs_g_per_unit` | float | nullable | Denormalised from Catalog at assignment time |
| `created_at` | timestamptz | NOT NULL, server default `now()` | |
| `updated_at` | timestamptz | NOT NULL, server default `now()`, auto-updated | Used for "recently used" product sort order |

**Indexes:** composite `(user_id, date)` for week-range queries.  
**Constraints:** max 10,000 assignments per user enforced in service layer (INV-010).

**Why nutrition is denormalised:** PDF export and weekly summary must complete in < 3 s (NFR-004) without calling the Catalog service at render time.

### `nutrition_targets`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `user_id` | integer | NOT NULL, indexed | |
| `target_calories` | float | NOT NULL, default 0 | Daily kcal target ≥ 0 (INV-013) |
| `protein_g` | float | NOT NULL, default 0 | Daily protein target |
| `fat_g` | float | NOT NULL, default 0 | Daily fat target |
| `carbs_g` | float | NOT NULL, default 0 | Daily carbs target |
| `created_at` | timestamptz | NOT NULL, server default `now()` | |
| `updated_at` | timestamptz | NOT NULL, server default `now()`, auto-updated | |

**Constraints:** `UNIQUE (user_id)` — exactly one target row per user (INV-014). `PUT /plan/target` is an upsert.

### `tracking_entries`

Write-only log created by the "log from plan" feature (ADR-0001). Read UI deferred to v1.1.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `user_id` | integer | NOT NULL, indexed | |
| `product_id` | integer | NOT NULL | Logical FK to Catalog |
| `product_name` | varchar(255) | NOT NULL | Denormalised for log readability |
| `quantity` | float | NOT NULL | |
| `unit` | varchar(50) | NOT NULL | |
| `logged_at` | timestamptz | NOT NULL, server default `now()` | |
| `source_assignment_id` | integer | nullable, indexed | Points back to the `meal_plan_assignments.id` that was logged |

---

## Shopping database

Owns one active shopping list per user and its aggregated items.

### `shopping_lists`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `user_id` | integer | NOT NULL, indexed | |
| `from_date` | date | NOT NULL | Start of the date range |
| `to_date` | date | NOT NULL | End of the date range; `from_date <= to_date` enforced by Pydantic (INV-011) |
| `is_stale` | boolean | NOT NULL, default `false` | Set `true` when a plan mutation event (assign/move/delete) falls within the range (INV-012, ADR-0003) |
| `generated_at` | timestamptz | NOT NULL, server default `now()` | Updated on each regeneration |

**Constraints:** `UNIQUE (user_id)` — one active list per user (ADR-0008). Re-generating replaces items in-place (upsert pattern: delete old items, update row).

### `shopping_list_items`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | integer | PK, autoincrement | |
| `list_id` | integer | NOT NULL, FK → `shopping_lists.id` CASCADE, indexed (`ix_shopping_list_items_list_id`) | |
| `product_id` | integer | NOT NULL | Logical FK to Catalog `products.id` |
| `product_name` | varchar(255) | NOT NULL | Denormalised from Catalog |
| `category` | varchar(100) | nullable | Populated from Catalog (best-effort; `NULL` when Catalog unavailable) |
| `total_quantity` | float | NOT NULL | Sum of `quantity` across all assignments in the date range for this `(product_id, unit)` |
| `unit` | varchar(50) | NOT NULL | Aggregation key alongside `product_id` — same product in different units is a separate row |

---

## Cross-service data flow

```
Identity ──(account_id in JWT)──► Catalog
                                  Planning
                                  Shopping

Catalog ──(product data via HTTP at assignment time)──► Planning (denormalised into meal_plan_assignments)
        ──(category enrichment via HTTP at generation time)──► Shopping (shopping_list_items.category)

Planning ──(assignments via HTTP at generation time)──► Shopping (aggregated into shopping_list_items)
```

No database-level foreign keys exist between services. All cross-service references use logical IDs validated at the HTTP layer.
