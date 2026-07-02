# Database analysis — Localization & catalog scale (10k products/language)

> Scope: adjustments needed to (a) localize the product catalog and (b) keep the
> catalog read path performant at ~10,000 products **per language**.
> Decisions taken: **translation tables** for l10n; **denormalized name + locale**
> stored in Planning/Shopping (preserve NFR-004 < 3s render without Catalog calls).

---

## 1. Problems in the current design

### 1a. Scale problems (already present at single-language 10k)

| # | Location | Problem | Effect at 10k×N |
|---|----------|---------|-----------------|
| S1 | `query/service.py:82` | `list_products` returns `result.scalars().all()` — **no LIMIT/OFFSET**, never computes `total` | Whole table loaded + serialized per request |
| S2 | `query/service.py:44` | `name.ilike("%search%")` — **leading wildcard** defeats btree `ix_products_name` | Sequential scan + per-row case-fold |
| S3 | `query/service.py:41` | `diet_tags.contains()` on a `JSON` (not `JSONB`) column | Unindexable; also `"veg"` matches `"vegan"` (substring, not membership) |
| S4 | `query/service.py:61-69` | sort by protein/calories does an unbounded outerjoin + `nulls_last` sort, no index | Full sort of joined set every call |
| S5 | schema | `created_at`/`category` have no composite index to back common filter+sort combos | Scans for category browse + name sort |

### 1b. Localization is entirely absent

- `products.name`, `products.category` are single `varchar` columns — no `locale` dimension.
- `category` is **free-text** `varchar(100)` (no category table) → not translatable.
- `diet_tags` are free strings → not translatable, no controlled vocabulary.
- Denormalized `product_name` is copied into **Planning** (`meal_plan_assignments`,
  `tracking_entries`) and **Shopping** (`shopping_list_items`) — freezes one language
  at write time with no record of which.

---

## 2. Target schema (Catalog DB)

### `products` — language-neutral only
```
id            integer PK
owner_id      integer  null=global, indexed
category_id   integer  FK -> categories.id, indexed        (was free-text `category`)
diet_tags     -> moved to product_diet_tags (see below)    (was JSON)
is_deleted    boolean
created_at    timestamptz
```
Nutrition (`nutrition_per_100g`) and `product_units` stay as-is — they are
language-neutral (numbers + unit codes; unit *labels* are localized in the UI layer,
not the DB).

### `product_translations` — the localized strings
```
id            integer PK
product_id    integer FK -> products.id CASCADE
locale        varchar(10)   e.g. 'en', 'de', 'en-US' (BCP-47)
name          varchar(255)  NOT NULL
search_tsv    tsvector      generated, for FTS (see §3)
UNIQUE (product_id, locale)
```
One row per product per language. A product need not have all locales; the API
falls back to a default locale (e.g. `en`) when the requested one is missing.

### `categories` + `category_translations` (controlled vocabulary)
```
categories                       category_translations
  id PK                            id PK
  code varchar(50) UNIQUE          category_id FK
                                   locale varchar(10)
                                   label  varchar(100)
                                   UNIQUE(category_id, locale)
```

### `diet_tags` + `diet_tag_translations` + `product_diet_tags` (join)
```
diet_tags                        product_diet_tags (M:N)
  id PK                            product_id FK
  code varchar(50) UNIQUE          diet_tag_id FK
                                   PK(product_id, diet_tag_id)
diet_tag_translations
  diet_tag_id FK, locale, label, UNIQUE(diet_tag_id, locale)
```
This makes diet-tag filtering an indexed join (S3 fixed) and translatable.

---

## 3. Indexing for 10k×N

| Goal | Index |
|------|-------|
| Substring/typeahead search (fixes S2) | `pg_trgm` GIN on `product_translations.name`: `CREATE INDEX ... USING gin (name gin_trgm_ops)` — supports `ILIKE '%x%'` |
| OR full-text search | `GIN (search_tsv)` + query with `to_tsquery`, per-locale config |
| Per-locale exact/prefix sort | btree `(locale, name)` — language-correct ordering needs **ICU collation** (`name COLLATE "de-x-icu"`) |
| Category browse + name sort | composite `(category_id, ...)` on products joined to translation name |
| diet-tag filter (fixes S3) | btree on `product_diet_tags(diet_tag_id, product_id)` |
| nutrition sort (fixes S4) | `nutrition_per_100g(product_id, calories)` / `(product_id, protein_g)` |

**Choose trgm for "contains" typeahead; tsvector for word/stemmed search.** Both are
per-locale concerns — stemming config differs by language (`english`, `german`…), so
FTS needs the locale to pick the right text-search configuration.

---

## 4. Query path changes (`query/service.py`)

1. **Add pagination** — `limit`/`offset` params (cap `limit`, e.g. 50–100), plus a
   separate `SELECT count(*)` with the same filters to fill `ProductListResponse.total`.
   Consider **keyset pagination** (`WHERE (name,id) > (:last_name,:last_id)`) for deep
   pages — OFFSET 9900 still scans 9900 rows.
2. **Join `product_translations` on the request locale** (with fallback to default
   locale via `COALESCE`/`LEFT JOIN` on both locale + default).
3. **Search** → `name @@ to_tsquery(:cfg, :q)` (FTS) or `name ILIKE :q` backed by trgm.
4. **diet_tag filter** → join `product_diet_tags`.
5. **Sort name** → apply ICU collation for the locale.

API: add a `locale` query param (or derive from `Accept-Language` / user profile).

---

## 5. Cross-service (denormalization) impact

`product_name` is denormalized into Planning & Shopping to keep PDF/summary render
< 3s without a Catalog call (NFR-004). Decision: **keep denormalizing, add `locale`.**

| Table | Add |
|-------|-----|
| `meal_plan_assignments` | `locale varchar(10)` next to `product_name` |
| `tracking_entries` | `locale varchar(10)` |
| `shopping_list_items` | `locale varchar(10)` (and category label already denormalized — store localized label too) |

- At assignment/generation time, Catalog returns the name **in the user's locale**;
  Planning/Shopping store both the string and the locale it was captured in.
- Trade-off: if the user later switches language, **already-planned** items keep the
  old-language name until re-saved. Acceptable for NFR-004; document it. A "refresh
  names" action can re-fetch by `product_id` + new locale if needed.
- Shopping aggregation key stays `(product_id, unit)` — **not** name — so aggregation
  is unaffected by language.

---

## 6. Migration plan (phased, Alembic)

1. **Catalog, additive:** create `categories(+trans)`, `diet_tags(+trans)`,
   `product_translations`. Backfill: copy each `products.name` → `product_translations`
   with `locale='en'`; map distinct `category` strings → `categories`; explode
   `diet_tags` JSON → join rows.
2. **Catalog, indexes:** `CREATE EXTENSION pg_trgm`; build GIN/btree indexes
   `CONCURRENTLY` (off-transaction) to avoid locking the 10k×N table.
3. **Catalog, cutover:** switch `query/service.py` to the translation join + pagination;
   add `category_id` FK; drop old `products.name`/`category`/`diet_tags` columns in a
   later release once readers are migrated.
4. **Planning/Shopping, additive:** add nullable `locale`; backfill `'en'`; have
   Catalog client send locale on new writes.
5. Update `docs/database.md`, NFR-002 benchmark target (re-validate at 10k×N), and the
   seed scripts to emit translations.

---

## 7. Open items to confirm

- Locale granularity: language only (`de`) vs. region (`de-AT`)? Affects fallback chain.
- Are **global** products translated centrally, while **user-owned** products are
  single-locale (the creator's)? Likely yes — saves translating user data.
- Default/fallback locale (recommend `en`).
- INV-007 "max 500 user products" — count products, not translation rows (unchanged).

---

## 8. Benchmark results (2026-07-02) — NFR-002 at 10k/language

Measured with `backend/catalog/scripts/bench_search.py` against the running Catalog
API on local PostgreSQL 16, after importing USDA Foundation + SR Legacy (~8.3k real
`en` products) and seeding 10,000 synthetic products per locale
(`en` = 18,268, `de` = 10,005 — both ≥ 10k/language):

| Scenario (limit=50, 40 iterations) | Matches | Median | p95 | NFR-002 ≤ 200 ms |
|---|---|---|---|---|
| broad `zeta` @ `de` (matches all 10k) | 10,000 | 27.2 ms | **32.5 ms** | PASS |
| broad `zeta` @ `en` | 10,000 | 29.1 ms | **34.4 ms** | PASS |
| selective `4242` @ `de` | 1 | 22.7 ms | **33.8 ms** | PASS |

**NFR-002 holds at 10k products per language with ~6× headroom.**

**Finding — the `pg_trgm` index is NOT used by the localized search.** `EXPLAIN ANALYZE`
shows a `Seq Scan on products` + `Hash Left Join` + `Filter: COALESCE(t.name, p.name)
ILIKE '%…%'` (exec ~12 ms at 18k rows). The `COALESCE(translation, base)` over the
LEFT JOIN — introduced to implement the locale-with-fallback read — cannot use the
per-column trigram indexes (`ix_products_name_trgm`, `ix_product_translations_name_trgm`).
We still pass comfortably because a seq scan of ~18k rows is cheap, but this will grow
linearly with the catalogue. **Follow-up options** (not urgent while p95 ≪ 200 ms):
1. Rewrite search as `t.name ILIKE :q OR (t.name IS NULL AND p.name ILIKE :q)` so each
   side can use its own trigram index.
2. Materialize a per-(product, locale) resolved-name column with its own trgm index.
3. Query `product_translations` for the locale directly, unioned with untranslated
   products' base name.

The benchmark is repeatable (`python -m scripts.bench_search`); bench rows are tagged
`source='scale_bench'` and removed on completion.
