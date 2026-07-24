# Database Architecture Diagrams

## 1. Database Context Map

Four independent PostgreSQL databases, one per bounded context. Cross-service reads happen exclusively via HTTP APIs.

```
┌─────────────────────────────────────────────────────────────┐
│                      Meal Forge Services                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   IDENTITY DB    │      │   CATALOG DB     │      │   PLANNING DB    │      │   SHOPPING DB    │
│   (Port 8001)    │      │   (Port 8002)    │      │   (Port 8003)    │      │   (Port 8004)    │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ • accounts       │      │ • products       │      │ • assignments    │      │ • lists          │
│ • sessions       │◄─────│ • units          │      │ • targets        │      │ • items          │
│ • reset_tokens   │      │ • nutrition      │◄─────│ • tracking       │◄─────┤                  │
│                  │      │ • translations   │      │                  │      │                  │
│                  │      │ • week_flags     │      │                  │      │                  │
└──────────────────┘      └──────────────────┘      └──────────────────┘      └──────────────────┘
        ▲                          ▲                          ▲                         ▲
        │                          │                          │                         │
        │ GET /auth/session        │ GET /products/{id}       │ GET /plan?week=...     │
        │ (token validation)       │ GET /products?week_flag  │ Meal assignments       │
        │                          │ (category enrichment)    │                         │
        └──────────────────────────┴──────────────────────────┴─────────────────────────┘
                                  All services call Identity for session validation

          ┌─────────────────────────────────────────────────────┐
          │           Next.js Frontend (Port 3000)              │
          │  • Auth pages                                       │
          │  • Product catalog UI                               │
          │  • Meal planner UI                                  │
          │  • Shopping list UI                                 │
          └─────────────────────────────────────────────────────┘
```

**Key insights**:
- Each service owns its database; no shared tables
- All cross-service reads are stateless HTTP calls
- Identity is the trust anchor: all services validate tokens by calling it
- Forward compatibility: services tolerate missing/stale data from other services

---

## 2. Entity-Relationship Diagrams

### Identity Database
```
┌─────────────────────┐
│     accounts        │  
├─────────────────────┤
│ PK id (Integer)     │
│    email (String)   │
│    password_hash    │
│    role (Enum)      │
│ failed_sign_in_cnt  │
│ locked_until (TS)   │
│ created_at (TS)     │
└─────────────────────┘
        │ 1
        │
        │ N
        ├───────────────────────────────────┐
        │                                   │
        ▼ 1                                 ▼ 1
┌─────────────────────┐        ┌─────────────────────┐
│    sessions         │        │   reset_tokens      │
├─────────────────────┤        ├─────────────────────┤
│ PK id               │        │ PK id               │
│ FK account_id ──────┼────────│──FK account_id      │
│    token (unique)   │        │    token (unique)   │
│    is_valid         │        │    is_used          │
│    created_at       │        │    expires_at       │
│    expires_at       │        │    created_at       │
└─────────────────────┘        └─────────────────────┘

Indexes:
  • accounts: ix_accounts_email (unique)
  • sessions: ix_sessions_token (unique), ix_sessions_account_id
  • reset_tokens: ix_reset_tokens_token (unique), ix_reset_tokens_account_id
```

### Catalog Database
```
┌──────────────────────────┐
│       products           │ (global: owner_id=NULL, user: owner_id=user_id)
├──────────────────────────┤
│ PK id                    │
│    owner_id (nullable)   │
│    name (localized→see   │
│    category              │  product_translations)
│    diet_tags (JSON)      │
│    source (USDA id)      │
│    external_id           │
│    is_deleted            │
│    created_at            │
└──────────────────────────┘
    │ 1
    │
    ├─────────────────────┬─────────────────────┬──────────────────┐
    │                     │                     │                  │
    ▼ N                   ▼ N                   ▼ N                ▼ N
┌─────────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  product_units          │ │nutrition_per_100g    │ │ product_translations │
├─────────────────────────┤ ├──────────────────────┤ ├──────────────────────┤
│ PK id                   │ │ PK id                │ │ PK id                │
│ FK product_id           │ │ FK product_id (U)    │ │ FK product_id        │
│    unit_name            │ │    calories          │ │    locale            │
│    grams_per_unit       │ │    protein_g         │ │    name              │
└─────────────────────────┘ │    fat_g             │ └──────────────────────┘
                            │    carbs_g           │
                            └──────────────────────┘

                          ┌──────────────────────┐
                          │   week_flags         │
                          ├──────────────────────┤
                          │ PK id                │
                          │ FK product_id        │
                          │    user_id           │
                          │    flag (Enum)       │
                          │    updated_at        │
                          │ U (product_id,       │
                          │   user_id)           │
                          └──────────────────────┘

Indexes:
  • products: ix_products_name, ix_products_owner_id, ix_products_name_trgm (GIN per-locale)
  • product_units: ix_product_units_product_id
  • nutrition: ix_nutrition_per_100g_product_id
  • product_translations: per-locale trigram GIN, (product_id, locale)
  • week_flags: ix_week_flags_product_id, ix_week_flags_user_id
```

### Planning Database
```
┌────────────────────────────────────┐
│   meal_plan_assignments            │ (denormalized product_name + nutrition)
├────────────────────────────────────┤
│ PK id                              │
│    user_id                         │
│    product_id (no FK)              │
│    product_name                    │
│    date                            │
│    meal_slot (Enum)                │
│    quantity                        │
│    unit                            │
│    kcal_per_unit (nullable)        │
│    protein_g_per_unit (nullable)   │
│    fat_g_per_unit (nullable)       │
│    carbs_g_per_unit (nullable)     │
│    created_at                      │
│    updated_at                      │
└────────────────────────────────────┘
         │
         ├── ix_meal_plan_assignments_user_id
         ├── ix_meal_plan_assignments_product_id
         ├── ix_meal_plan_assignments_date
         └── ix_meal_plan_assignments_user_date

┌─────────────────────────────┐     ┌──────────────────────────┐
│   nutrition_targets         │     │  tracking_entries        │ (write-only log)
├─────────────────────────────┤     ├──────────────────────────┤
│ PK id                       │     │ PK id                    │
│ FK user_id (unique)         │     │    user_id               │
│    target_calories          │     │    product_id            │
│    protein_g                │     │    product_name          │
│    fat_g                    │     │    quantity              │
│    carbs_g                  │     │    unit                  │
│    created_at               │     │    logged_at             │
│    updated_at               │     │    source_assignment_id  │
└─────────────────────────────┘     └──────────────────────────┘

Indexes:
  • assignments: (user_id, date) for weekly queries
  • nutrition_targets: ix_nutrition_targets_user_id
  • tracking_entries: ix_tracking_entries_user_id, ix_tracking_entries_source_assignment_id
```

### Shopping List Database
```
┌──────────────────────────────┐
│    shopping_lists            │ (one active list per user)
├──────────────────────────────┤
│ PK id                        │
│ FK user_id (unique)          │
│    from_date                 │
│    to_date                   │
│    is_stale                  │
│    generated_at              │
└──────────────────────────────┘
         │ 1
         │
         │ N
         ▼
┌──────────────────────────────┐
│  shopping_list_items         │ (aggregated by product_id + unit)
├──────────────────────────────┤
│ PK id                        │
│ FK list_id                   │
│    product_id (no FK)        │
│    product_name              │
│    category (nullable)       │
│    total_quantity            │
│    unit                      │
└──────────────────────────────┘

Indexes:
  • shopping_lists: ix_shopping_lists_user_id
  • shopping_list_items: ix_shopping_list_items_list_id
```

---

## 3. Data Flow Diagram

### Weekly Shopping List Generation

```
User requests: GET /shopping

         ↓
┌────────────────────────────────────────────────────┐
│     Shopping Service (generate flow)               │
├────────────────────────────────────────────────────┤
│                                                    │
│  1. Check for active list (shopping_lists table)  │
│     ├─ Exists? Return cached list                 │
│     └─ Not exists? Generate new one               │
│                                                    │
│  2. Fetch plan for ISO week Mon–Sun               │
│     └─ Call Planning Service concurrently:        │
│        POST /plan?week=YYYY-WNN                   │
│        ↓ Returns: list[AssignmentResponse]        │
│                                                    │
│  3. Aggregate by (product_id, unit)               │
│     └─ Sum quantities for each unique product     │
│        ↓ Returns: {product_id → total_quantity}   │
│                                                    │
│  4. Enrich with category (optional)               │
│     └─ Call Catalog concurrently:                 │
│        GET /products/{product_id}                 │
│        ↓ Returns: category (or NULL fallback)     │
│                                                    │
│  5. Upsert shopping_lists + insert items          │
│     └─ Replace previous list (if any)             │
│        ↓ Store: shopping_list_items rows          │
│                                                    │
│  6. Return: {list_id, from_date, to_date, items} │
│                                                    │
└────────────────────────────────────────────────────┘
         ↓
       200 OK
```

### Meal Plan Assignment Creation

```
User creates: POST /plan/assignments

         ↓
┌────────────────────────────────────────────────────┐
│    Planning Service (create flow)                  │
├────────────────────────────────────────────────────┤
│                                                    │
│  1. Validate token                                │
│     └─ Call Identity: GET /auth/session           │
│        ↓ Returns: {account_id, role}              │
│                                                    │
│  2. Fetch product from Catalog (at creation time) │
│     └─ Inline nutrition into assignment row:      │
│        - kcal_per_unit                            │
│        - protein_g_per_unit                       │
│        - fat_g_per_unit                           │
│        - carbs_g_per_unit                         │
│                                                    │
│  3. Insert into meal_plan_assignments             │
│     └─ Denormalized row: {product_id, unit,      │
│        quantity, kcal_per_unit, ...}              │
│                                                    │
│  4. Mark Shopping List stale (optional)           │
│     └─ Call Shopping: POST /shopping/events/...   │
│        ↓ Sets is_stale = true (if in range)       │
│                                                    │
│  5. Log to tracking_entries (optional)            │
│     └─ Append write-only row for audit            │
│                                                    │
└────────────────────────────────────────────────────┘
         ↓
       201 Created
```

---

## 4. Schema Evolution Notes

### Adding a Column

1. Write Alembic migration in `backend/<service>/db/migrations/versions/`
2. Run `alembic upgrade head` (local testing)
3. In production: Railway auto-runs `alembic upgrade head` on deploy
4. No schema downtime needed; migrations are additive

### Data Consistency

- **Identity** ↔ other services: one-way (Identity never reads others)
- **Catalog** ← other services: read-only, stateless
- **Planning** ← Shopping: read-only, concurrent calls with fallback
- No saga patterns; transactional consistency is per-service, distributed tracing is via request IDs

### Testing

All services use in-memory SQLite + Alembic migrations in test setup:
```python
# In conftest.py
engine = create_async_engine("sqlite+aiosqlite:///:memory:")
async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)
```

---

## 5. Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Session validation | < 50ms | HTTP to Identity; cached in app |
| Product search (10k products) | < 200ms p95 | Trigram GIN indexes per locale |
| Meal plan assignment creation | < 100ms | Insert + optional Catalog call |
| Shopping list generation (31 days) | < 500ms | Concurrent Planning + Catalog calls |
| PDF export | < 3s | reportlab in-memory generation |

---

## References
- Full schema: [ADR-0014: Database Schema Design](adr/0014-database-schema-design.md)
- Per-service CLAUDE.md for migration walkthroughs
