# Catalog Components

Product discovery and management UI for Meal Forge. Implements search, filtering, sorting, pagination, and week-flag tagging.

## Features

### Search & Filtering

- **Server-side search**: Search queries are sent to the backend API (`?search=<query>`) for case-insensitive matching across product names
- **Category filter**: Exact match on product category (sent as `?category=<name>` to API)
- **Diet tag filter**: Client-side multi-select filter on loaded products (e.g., Vegan, Gluten-Free)
- **Sorting**: Sort by name, category, calories, or protein (client-side on loaded results)

### Pagination (Infinite Scroll)

Products are loaded in **200-product pages**. When you reach the bottom of the list, the next 200 automatically load.

**How it works:**
1. Initial load: fetches 200 products from the API with filters applied
2. Scroll near bottom: triggers `IntersectionObserver` on the sentinel element
3. Load more: appends next 200 products to the list
4. Done: stops when API returns fewer than 200 products

**Implementation:**
- `ProductsPage` state: `offset` (current page position), `hasMore` (whether more data exists), `isLoadingMore` (loading spinner)
- Sentinel element: `<div id="products-end-sentinel" />` at the end of the table triggers the observer
- Observer threshold: 0.1 (10% visible) to trigger load before actually reaching the bottom

**API calls:**
```
GET /products?search=chick&limit=200&offset=0&user_id=1
GET /products?search=chick&limit=200&offset=200&user_id=1
GET /products?search=chick&limit=200&offset=400&user_id=1
...
```

### Week Flags

Each product can be marked as:
- **This week** — include in the current week's meal plan
- **Next week** — include in next week's plan
- **None** — unmarked (default)

**Week flag toggle UI:** Click the flag icon in the product detail modal or use the `WeekFlagToggle` component.

**Backend behavior (ADR-0009):**
- Every Monday 00:00 UTC, `next_week` flags are promoted to `this_week`
- Stale `this_week` flags (not updated since the last rollover) are cleared
- Flags are per-user per-product, stored in the `week_flags` table

**Frontend implementation:**
- `WeekFlagToggle.tsx`: UI for cycling through the three states
- `setWeekFlag()` API call: `PUT /products/{id}/week-flag`
- Persisted in the `Product` type as `week_flag?: { flag: 'this_week' | 'next_week' | 'none' } | null`

## Component Map

| Component | Purpose |
|-----------|---------|
| **ProductsPage** (`../app/(app)/products/page.tsx`) | Main page: fetch, pagination state, filter controls, modal routing |
| **FilterBar** | Search input, category dropdown, diet tag pills, sort controls, clear button |
| **ProductTable** | Sortable table view: name, category, nutrition, diet tags; row click → detail modal |
| **CategoryGrid** | Grid of category cards; click → filter to that category |
| **ProductDetailModal** | Full product detail: nutrition facts, units, week flag toggle, edit/delete/add actions |
| **ProductForm** | Create/edit product dialog: name, category, nutrition, units, diet tags |
| **WeekFlagToggle** | Cycling button: None → This Week → Next Week → None |
| **MacroPieChart** | Visual macro split (protein/fat/carbs %) in the detail view |
| **UnitConversionTable** | Display all units and their gram equivalents for a product |

## State Flow

### Initial Load

```
ProductsPage mounts
  ↓
useEffect (filters.search, filters.category changed)
  ↓
getProducts(token, {
  q: filters.search,           // sent as ?search=...
  category: filters.category,  // sent as ?category=...
  limit: 200,
  offset: 0,
  user_id: session?.accountId
})
  ↓
Dispatch SUCCESS → allProducts = [200 products from API]
```

### Search/Filter Change

```
User types "chick" or selects category
  ↓
setFilters() updates search/category
  ↓
useEffect triggered (filters.search, filters.category in deps)
  ↓
Reset offset=0, hasMore=true, isLoadingMore=false
  ↓
New getProducts() call with updated q/category
  ↓
allProducts replaced with new 200 results
```

### Scroll to Load More

```
User scrolls to bottom
  ↓
IntersectionObserver fires (10% of sentinel visible)
  ↓
loadMore() called if hasMore && !isLoadingMore
  ↓
getProducts(token, {
  q: filters.search,
  category: filters.category,
  limit: 200,
  offset: 200,  // next page
  user_id
})
  ↓
Dispatch SUCCESS → allProducts = [...oldProducts, ...newProducts]
  ↓
offset += 200
  ↓
setHasMore(newProducts.length === 200)
```

### Week Flag Toggle

```
User clicks flag icon in detail modal
  ↓
setWeekFlag(token, productId, 'this_week' | 'next_week' | 'none')
  ↓
PUT /products/{id}/week-flag { flag: '...' }
  ↓
API returns updated Product with week_flag set
  ↓
onProductUpdated() → allProducts array updated
  ↓
Detail modal refreshed with new flag state
```

## API Integration

### `getProducts(token, query: ProductsQuery)`

**Query parameters:**
- `q?: string` — search query (sent as `?search=...`)
- `category?: string` — category filter
- `limit?: number` — page size (default 200, max 200)
- `offset?: number` — pagination offset (default 0)
- `sort_by?: 'name' | 'category' | 'calories' | 'protein_g' | ...`
- `sort_dir?: 'asc' | 'desc'`
- `week_flag?: 'this_week' | 'next_week'` — filter by flag (requires user_id)
- `user_id?: number` — user ID (passed by ProductsPage)

**Returns:** `Product[]` (from API response `data.items`)

**Example calls:**
```typescript
// Search with pagination
getProducts(token, { q: 'chicken', limit: 200, offset: 0 })

// Category filter
getProducts(token, { category: 'Meat & Poultry', limit: 200, offset: 0 })

// Week flag filter (load only products marked for this week)
getProducts(token, { week_flag: 'this_week', user_id: 123 })
```

### `setWeekFlag(token, id: number, flag: WeekFlagValue)`

Sets the week flag for a product.

**Returns:** Updated `Product` with `week_flag` set

**Example:**
```typescript
await setWeekFlag(token, 42, 'this_week')
// → { id: 42, name: '...', week_flag: { flag: 'this_week' }, ... }
```

## Known Limitations & Future Work

1. **Pagination UI:** Shows loading spinner and "No more products" message, but no page count or jump-to-page
2. **Client-side diet filter:** Applied after loading; doesn't reload from API. To search by diet tag server-side, need to add `diet_tag` parameter to API calls
3. **Localization:** Frontend doesn't request `?locale=...` yet; always gets English (default)
4. **Edit/delete** only work on user-owned products; global products show a disabled edit button

## Testing

### Manual Test Checklist

- [ ] Search for "chick" → see all 400+ chicken products load as you scroll
- [ ] Filter by category "Meat & Poultry" → only those products shown
- [ ] Select diet tag "High-Protein" → products not matching removed from display
- [ ] Sort by Protein descending → products reordered
- [ ] Click a product → detail modal opens with nutrition, units, week flag
- [ ] Toggle week flag → saved to backend, reflected in modal
- [ ] Add new product → form modal opens, creates product, modal closes, added to list
- [ ] Edit own product → form modal opens with existing data, updates on save
- [ ] Try to edit global product → button disabled or 403 error shown

### Component Unit Tests

See `src/__tests__/` for existing tests:
- `ProductTable.test.tsx` — table rendering, sorting, row clicks
- `ProductDetailModal.test.tsx` — detail modal open/close, week flag toggling
- `ProductForm.test.tsx` — form submission, validation, edit mode

## Performance Notes

- **Search latency**: Backend search uses trigram indexes (pg_trgm) for fast ILIKE; p95 ≈ 30 ms at 10k products/language
- **Pagination**: Loading 200 at a time reduces re-render churn vs. 50; infinite scroll feels instant
- **Filter responsiveness**: Sorting and diet-tag filtering are client-side (instant); search/category require API call (50–100 ms)

## Related Documentation

- [Backend Catalog README](../../backend/catalog/README.md) — API endpoints, week-flag system, ADRs
- [Meal Forge Frontend README](../../frontend/README.md) — build, environment, architecture
- [ADR-0002: Week flag support](../../meta/architecture/decisions/adr/0002-meal-planning-week-context.md)
- [ADR-0009: Monday rollover](../../meta/architecture/decisions/adr/0009-weekly-flag-rollover.md)
- [ADR-0012: Product localization](../../meta/architecture/decisions/adr/0012-product-catalog-localization-model.md)
