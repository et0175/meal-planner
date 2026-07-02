# ADR-0013: Global catalog seeded from USDA FoodData Central

**Status:** Accepted  
**Date:** 2026-07-02  
**Deciders:** @omelnikova  
**Revised:** —

## Context

NFR-010 sizes the global product catalogue at ~10,000 products per language, but the
Catalog service ships with only a 5-product `seed.py`. Users need a rich catalogue on
day one (US-056), which requires bulk-loading global products (`owner_id IS NULL`)
from a trusted external nutrition dataset rather than hand-authoring them.

The catalogue schema after ADR-0012 stores language-neutral products with per-locale
names in `product_translations`, plus `nutrition_per_100g` and `product_units`. Any
import must map an external record onto that shape and must be safe to re-run without
creating duplicates — the existing `seed.py` dedupes by matching on `name`, which is
fragile and breaks once names are localized.

## Decision

The MVP global catalogue is imported from **USDA FoodData Central (FDC)**, using the
**Foundation Foods and SR Legacy** datasets (generic whole foods suited to meal
planning), loaded by a **one-time bulk CLI importer**.

- **Provenance for idempotency:** add `source` and `external_id` to `products` with a
  partial `UNIQUE(source, external_id) WHERE external_id IS NOT NULL`. Imported rows
  use `source='usda_fdc'`, `external_id=<fdcId>`. Re-import is an upsert on that key.
  User-added products keep `source=NULL` and are never touched by the importer.
- **Mapping:** `food.description` → `products.name` and `product_translations(locale='en')`;
  `food_category` → `products.category`; per-100 g nutrients → `nutrition_per_100g`
  (energy = first available of nutrient ids **1008 → 2048 → 2047**, and when the
  source provides no energy nutrient at all, energy is **derived from macros via
  Atwater factors** (4·protein + 9·fat + 4·carbs); protein **1003**, fat **1004**,
  carbs **1005**; missing macros default to 0.0, so a product with neither energy
  nor macros keeps energy 0.0 but is still imported); `food_portion` →
  `product_units` (`grams_per_unit = gram_weight / amount`, base `100g` always present,
  capped at 10 per INV-004).
- **Datasets, not the API:** the CSV bulk download is used (no API key, no rate limits),
  filtered to `data_type in ('foundation_food','sr_legacy_food')`.
- **License:** FDC is US-government public domain — no attribution or share-alike
  obligation.

## Alternatives considered

### Open Food Facts
Crowd-sourced, multilingual names and diet labels, huge coverage. Rejected for MVP
because its ODbL license imposes attribution and share-alike obligations, coverage is
branded/noisy, and data quality is uneven. Retained as the likely source for
non-English translations and diet-tag enrichment in a later phase.

### Live third-party API (e.g. Edamam/Nutritionix)
Fetch-on-demand with caching. Rejected as the seeding mechanism: rate limits, API keys,
and per-call cost make it unsuitable for a 10k bulk preload. Could complement the bulk
load later for long-tail search misses.

### Keep hand-authored seed
Rejected — cannot reach the NFR-010 catalogue size and gives users an empty-feeling
catalogue.

## Consequences

### Positive
- Day-one catalogue of curated whole foods with authoritative per-100 g nutrition; no
  licensing constraints.
- `(source, external_id)` makes re-import idempotent and cleanly separates imported
  globals from user data.
- The importer is decoupled (offline CLI) — no runtime dependency on FDC.

### Negative
- FDC names are English only → imported rows have a `locale='en'` translation only;
  other locales need a separate translation pass (deferred; schema already supports it).
- FDC carries no diet labels → `diet_tags` are empty for imported products until
  enriched from another source.
- Foundation Foods alone is ~469 items; reaching ~10k needs SR Legacy (and still falls
  short of 10k for a single language — Branded Foods was deliberately excluded as noisy).

### Neutral
- Category stays free-text (`products.category`); a controlled-vocabulary mapping is
  deferred with the ADR-0012 category/diet-tag normalization.
- Energy uses an Atwater fallback chain because Foundation foods populate 1008
  inconsistently (135/469) vs. 2047/2048; when no energy nutrient exists at all,
  energy is derived from macros (Atwater). In the Foundation import this recovered
  49 of 92 zero-energy products; the remaining 43 (no macros either — e.g. water)
  are kept with energy 0.0.
- One-time cadence chosen; a scheduled re-sync can reuse the same idempotent loader
  later without schema change.

## References

- DEC-012 (resolved by this ADR)
- ADR-0012 (localization model this importer writes into)
- CTX-003 (Product Catalog), CAP-003
- US-056 (pre-populated catalogue), FR-038 (bulk import), CON-008 (USDA source)
- NFR-010 (10k products per language), INV-004 (max 10 units), INV-006 (global products)
- `docs/database.md`, `docs/database-localization-scale-analysis.md`

## History

- 2026-07-02: Created — USDA FoodData Central (Foundation + SR Legacy) adopted as the
  MVP global-catalogue source via a one-time idempotent bulk importer keyed on
  (source, external_id).
