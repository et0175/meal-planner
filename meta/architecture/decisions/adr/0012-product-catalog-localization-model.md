# ADR-0012: Product catalog localization model

**Status:** Accepted  
**Date:** 2026-06-30  
**Deciders:** @omelnikova  
**Revised:** —

## Context

The Product Catalog (CTX-003) currently stores product data in a single language.
`products.name` and `products.category` are plain `varchar` columns, `diet_tags`
is an unindexed `JSON` column, and the list endpoint (`GET /products`) returns the
entire filtered result set with no pagination. There is no `locale` dimension
anywhere in the domain model, and no requirement (FR or NFR) currently describes
localization.

A new goal requires the catalogue to hold roughly **10,000 products per language**.
This changes two things at once:

1. **Localization** — products, categories, and diet tags must carry per-language
   text, with a fallback when a requested language is missing.
2. **Scale** — NFR-010 sized the catalogue at 10,000 *global* products and NFR-002
   requires search/filter p95 ≤ 200 ms at that size. Multiplying by N languages
   pushes the catalog read path well past what the current implementation supports:
   - `name ILIKE '%term%'` uses a leading wildcard, so the `ix_products_name` btree
     cannot be used (sequential scan).
   - `diet_tags.contains()` on a `JSON` column is not indexable and matches on
     substrings rather than array membership.
   - the list endpoint loads and serializes the whole table per request.

The denormalized `product_name` copied into Meal Planning (`meal_plan_assignments`,
`tracking_entries`) and Shopping List (`shopping_list_items`) — denormalized to meet
NFR-004 (PDF/summary render < 3 s without a Catalog call) — records no language,
so it silently freezes one language's string at write time.

This ADR decides the data model for localization and the structural changes that
let the catalog meet NFR-002 at the larger row count. It does not change the
cross-context integration *style* (CTXREL-006 sync read, CTXREL-007 check-on-read),
which remain as decided in ADR-0002 and ADR-0003.

## Decision

We will adopt a **translation-table** model and keep `products` language-neutral.

**Catalog (CTX-003) schema:**

- `products` holds only language-neutral fields: `id`, `owner_id`, `category_id`
  (FK, replacing the free-text `category`), `is_deleted`, `created_at`. Nutrition
  (`nutrition_per_100g`) and `product_units` are already language-neutral and stay.
- `product_translations (id, product_id FK, locale, name)` with
  `UNIQUE (product_id, locale)` — one row per product per language.
- `categories (id, code UNIQUE)` + `category_translations (category_id, locale,
  label)`; diet tags become a controlled vocabulary: `diet_tags (id, code UNIQUE)`
  + `diet_tag_translations (diet_tag_id, locale, label)` + a `product_diet_tags`
  M:N join. This makes diet-tag filtering an indexed join instead of a JSON scan.
- **Indexing for scale:** a `pg_trgm` GIN index on `product_translations.name`
  (supports `ILIKE '%x%'` typeahead; choose a per-locale `tsvector` GIN instead if
  word/stemmed search is required), btree on the `product_diet_tags` join, and
  btree on the nutrition sort columns. Language-correct ordering uses ICU
  collation per locale.
- **Pagination:** `GET /products` takes `limit`/`offset` (capped) and returns a
  separate `total`; keyset pagination is preferred for deep pages. The endpoint
  takes a `locale` parameter (derived from the user profile / `Accept-Language`)
  and joins `product_translations` on that locale, falling back to a default
  locale (`en`) when the requested translation is absent.

**Downstream contexts (CTX-004, CTX-005):** continue to denormalize the product
name (preserving NFR-004) but **store the `locale` alongside it**. New columns
`locale` on `meal_plan_assignments`, `tracking_entries`, and `shopping_list_items`
record the language captured at assignment/generation time. Shopping List
aggregation remains keyed by `(product_id, unit)` — never by name — so language
never affects aggregation.

**Scope of localization:** global products (`owner_id IS NULL`) carry the full set
of translations; user-owned products are stored single-locale in the creator's
language. The default fallback locale is `en`.

## Alternatives considered

### jsonb_per_row
Store `name` as a JSONB map (`{"en": "Milk", "de": "Milch"}`) directly on
`products`, keep `category` as a code, and `diet_tags` as a `text[]`. Fewer tables
and a single row per product. Rejected because per-locale search requires a
separate expression index per locale (`((name->>'en'))`), language-correct sorting
and collation are awkward over a JSONB field, and there is no place to attach a
controlled vocabulary for categories/diet tags. The translation-table model indexes
and scales more naturally for the 10k×N target and keeps search/sort per-locale
first-class.

### Resolve names at render instead of denormalizing locale
Drop the denormalized name downstream and fetch translations from Catalog by the
user's current locale at render time. Always current/correct language, but adds a
Catalog call to PDF/summary rendering, which risks NFR-004 (< 3 s, no Catalog call).
Rejected for MVP; revisit if a "show plan in my current language" requirement
appears.

## Consequences

### Positive
- Per-locale, indexable search (trigram/FTS) and language-correct sorting; fixes the
  leading-wildcard and JSON-scan problems, so NFR-002 can hold at 10k per language.
- Categories and diet tags become translatable controlled vocabularies, removing
  free-text drift and making their filters indexed joins.
- Downstream names render in the language captured at write time with no Catalog
  call, preserving NFR-004; the stored `locale` removes the silent-language ambiguity.

### Negative
- More tables and joins than the single-row model; larger migration with a backfill
  step (existing `name` → `product_translations` at `locale='en'`, distinct
  `category` strings → `categories`, JSON `diet_tags` → join rows).
- Indexes on a 10k×N table must be built `CONCURRENTLY` to avoid locking; requires
  the `pg_trgm` extension on the Catalog database.
- A user switching language sees already-planned/already-listed items keep their
  captured-language name until those rows are re-saved (acceptable for MVP; a
  "refresh names" action can re-fetch by `product_id` + new locale later).

### Neutral
- New requirements should be added to the model: a localization capability/FR, and a
  scalability NFR restating the target as "10,000 products **per language**" (NFR-010
  currently says 10,000 global). NFR-002's benchmark (`BenchSearchFilter_10kProducts`)
  must be re-validated at the per-language row count.
- The migration is phased and additive: create translation tables + backfill, build
  indexes, cut the query path over to the locale join + pagination, then drop the old
  `products.name`/`category`/`diet_tags` columns in a later release once all readers
  are migrated.
- INV-007 (max 500 user products) continues to count products, not translation rows.

## References

- DEC-011 (resolved by this ADR)
- CTX-003 (Product Catalog — owner of the localized data)
- CTX-004, CTX-005 (Meal Planning, Shopping List — denormalized name + locale)
- CTXREL-006 (Catalog → Meal Planning read), CTXREL-007 (Meal Planning → Shopping List)
- ADR-0002 (WeekFlag cross-context read — integration style unchanged)
- ADR-0003 (Shopping List staleness — integration style unchanged)
- NFR-002 (search/filter p95 ≤ 200 ms), NFR-010 (10k catalogue), NFR-011 (500 user products)
- FR-010 (browse products), FR-011 (filter/search/sort)
- `docs/database.md`, `docs/database-localization-scale-analysis.md` (detailed analysis)

## History

- 2026-06-30: Created — translation-table localization model adopted; downstream
  contexts store denormalized name + locale; pagination and per-locale trigram/FTS
  indexing added to meet NFR-002 at 10k products per language.
