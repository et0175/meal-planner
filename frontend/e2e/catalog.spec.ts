import { test, expect, type Page } from '@playwright/test'
import type { Product } from '../src/lib/api/catalog'

/**
 * Playwright e2e tests for CARD-004: Product Catalog UI.
 *
 * All API calls are intercepted — no real backend required.
 * Auth is injected into sessionStorage before navigation.
 *
 * AC-024: category cards; clicking reveals filtered products
 * AC-025: list view table with nutrition columns
 * AC-026: empty state when no products match
 * AC-027: filter by category
 * AC-028: filter by diet tag
 * AC-029: search by name (case-insensitive)
 * AC-030: no results → empty list (no error)
 * AC-031: sort by column
 * AC-033: add product → appears in catalog
 * AC-039: edit own product → changes reflected
 * AC-043/044: week flag toggle
 */

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SESSION = {
  token: 'test-token',
  accountId: 42,
  email: 'chef@example.com',
  role: 'user',
}

const SESSION_RESPONSE = {
  account_id: 42,
  email: 'chef@example.com',
  role: 'user',
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Atlantic salmon',
    category: 'Fish',
    diet_tags: ['mediterranean', 'keto'],
    owner_id: null,
    is_deleted: false,
    nutrition: { calories: 208, protein_g: 20, fat_g: 13, carbs_g: 0 },
    units: [{ id: 1, unit_name: 'fillet', grams_per_unit: 120 }],
    week_flag: null,
  },
  {
    id: 2,
    name: 'Greek yogurt',
    category: 'Dairy',
    diet_tags: ['protein-focused', 'mediterranean'],
    owner_id: 42, // own product
    is_deleted: false,
    nutrition: { calories: 88, protein_g: 15, fat_g: 0.6, carbs_g: 5.4 },
    units: [],
    week_flag: null,
  },
  {
    id: 3,
    name: 'Whole milk',
    category: 'Dairy',
    diet_tags: ['mediterranean'],
    owner_id: null,
    is_deleted: false,
    nutrition: { calories: 61, protein_g: 3.2, fat_g: 3.3, carbs_g: 4.8 },
    units: [],
    week_flag: null,
  },
]

const NEW_PRODUCT: Product = {
  id: 99,
  name: 'Hemp seeds',
  category: 'Nuts',
  diet_tags: ['plant-based'],
  owner_id: 42,
  is_deleted: false,
  nutrition: { calories: 166, protein_g: 9.5, fat_g: 14.6, carbs_g: 2.6 },
  units: [],
  week_flag: null,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function injectSession(page: Page): Promise<void> {
  await page.addInitScript((session) => {
    sessionStorage.setItem('mf_session', JSON.stringify(session))
  }, SESSION)
}

async function mockAuthOk(page: Page): Promise<void> {
  await page.route('**/auth/session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(SESSION_RESPONSE),
    })
  )
}

async function mockProducts(page: Page, products: Product[] = PRODUCTS): Promise<void> {
  await page.route('**/products**', (route) => {
    if (route.request().method() !== 'GET') return route.continue()
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(products),
    })
  })
}

async function waitForShell(page: Page): Promise<void> {
  await expect(page.getByRole('navigation', { name: 'Site sections' })).toBeVisible({
    timeout: 12_000,
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('CARD-004 Product Catalog UI', () => {
  test.beforeEach(async ({ page }) => {
    await injectSession(page)
    await mockAuthOk(page)
    await mockProducts(page)
  })

  // ── AC-024: category card grid ─────────────────────────────────────────────

  test('AC-024: default view shows category cards', async ({ page }) => {
    await page.goto('/products')
    await waitForShell(page)

    // Category cards should be visible
    await expect(page.getByRole('button', { name: /Fish/i })).toBeVisible({ timeout: 8_000 })
    await expect(page.getByRole('button', { name: /Dairy/i })).toBeVisible()
  })

  test('AC-024: clicking a category card switches to filtered list view', async ({ page }) => {
    await page.goto('/products')
    await waitForShell(page)

    await expect(page.getByRole('button', { name: /Fish/i })).toBeVisible({ timeout: 8_000 })
    await page.getByRole('button', { name: /Fish/i }).click()

    // Now in list view — should see Atlantic salmon
    await expect(page.getByText('Atlantic salmon')).toBeVisible({ timeout: 8_000 })
    // The filter bar should show category pre-selected
    await expect(page.getByRole('combobox', { name: /category/i })).toHaveValue('Fish')
  })

  // ── AC-025: list view table ────────────────────────────────────────────────

  test('AC-025: list view shows table with nutrition columns', async ({ page }) => {
    await page.goto('/products')
    await waitForShell(page)

    // Switch to list view
    await page.getByRole('button', { name: /list/i }).click()

    await expect(page.getByRole('table', { name: /product list/i })).toBeVisible({
      timeout: 8_000,
    })
    // Nutrition column headers
    await expect(page.getByRole('columnheader', { name: /kcal/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /protein/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /fat/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /carbs/i })).toBeVisible()

    // Product rows
    await expect(page.getByText('Atlantic salmon')).toBeVisible()
    await expect(page.getByText('Greek yogurt')).toBeVisible()
  })

  // ── AC-026: empty state ────────────────────────────────────────────────────

  test('AC-026: empty state shown when no products returned', async ({ page }) => {
    await page.route('**/products**', (route) => {
      if (route.request().method() !== 'GET') return route.continue()
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })

    await page.goto('/products')
    await waitForShell(page)

    // Category grid shows empty state
    await expect(page.getByText(/no products available/i)).toBeVisible({ timeout: 8_000 })
  })

  // ── AC-026: empty state when filters match nothing ─────────────────────────

  test('AC-030: empty list (no error) when search matches nothing', async ({ page }) => {
    await page.goto('/products')
    await waitForShell(page)

    await page.getByRole('button', { name: /list/i }).click()
    await expect(page.getByRole('searchbox')).toBeVisible({ timeout: 8_000 })

    // Type something that matches no products
    await page.getByRole('searchbox').fill('xyznonexistent')
    await page.waitForTimeout(400) // wait for debounce

    await expect(page.getByText(/no products match/i)).toBeVisible()
    // No error alert
    await expect(page.getByRole('alert')).not.toBeVisible()
  })

  // ── AC-027: filter by category ─────────────────────────────────────────────

  test('AC-027: filter bar category dropdown filters the list', async ({ page }) => {
    await page.goto('/products')
    await waitForShell(page)

    await page.getByRole('button', { name: /list/i }).click()
    await expect(page.getByRole('combobox', { name: /category/i })).toBeVisible({
      timeout: 8_000,
    })

    await page.getByRole('combobox', { name: /category/i }).selectOption('Fish')

    // Only Fish products visible
    await expect(page.getByText('Atlantic salmon')).toBeVisible()
    await expect(page.getByText('Greek yogurt')).not.toBeVisible()
  })

  // ── AC-029: search by name ─────────────────────────────────────────────────

  test('AC-029: name search filters products case-insensitively', async ({ page }) => {
    await page.goto('/products')
    await waitForShell(page)

    await page.getByRole('button', { name: /list/i }).click()
    await expect(page.getByRole('searchbox')).toBeVisible({ timeout: 8_000 })

    // Case-insensitive search: "SALMON" should match "Atlantic salmon"
    await page.getByRole('searchbox').fill('SALMON')
    await page.waitForTimeout(400)

    await expect(page.getByText('Atlantic salmon')).toBeVisible()
    await expect(page.getByText('Greek yogurt')).not.toBeVisible()
  })

  // ── AC-031: sort by column ─────────────────────────────────────────────────

  test('AC-031: clicking column header sorts the list', async ({ page }) => {
    await page.goto('/products')
    await waitForShell(page)

    await page.getByRole('button', { name: /list/i }).click()
    await expect(page.getByRole('table')).toBeVisible({ timeout: 8_000 })

    // Click calories column to sort by calories
    await page.getByRole('columnheader', { name: /kcal/i }).click()

    // After sort ascending by kcal, Whole milk (61) should be first
    const rows = page.getByRole('row').filter({ hasText: /\d/ }) // skip header
    await expect(rows.first()).toContainText('Whole milk')
  })

  // ── AC-032: product detail modal ───────────────────────────────────────────

  test('AC-032: clicking a product row opens detail modal with chart', async ({ page }) => {
    await page.goto('/products')
    await waitForShell(page)

    await page.getByRole('button', { name: /list/i }).click()
    await expect(page.getByText('Atlantic salmon')).toBeVisible({ timeout: 8_000 })

    await page.getByRole('button', { name: /view atlantic salmon/i }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByRole('heading', { name: /atlantic salmon/i })).toBeVisible()
    // Macro chart
    await expect(modal.getByRole('img', { name: /macro distribution/i })).toBeVisible()
    // Unit table
    await expect(modal.getByText('100 g')).toBeVisible()
    await expect(modal.getByText('1 fillet')).toBeVisible()
  })

  test('AC-039/040/042: edit+delete buttons visible only for own products', async ({ page }) => {
    await page.goto('/products')
    await waitForShell(page)

    await page.getByRole('button', { name: /list/i }).click()
    await expect(page.getByText('Atlantic salmon')).toBeVisible({ timeout: 8_000 })

    // Global product (owner_id null) — no edit/delete
    await page.getByRole('button', { name: /view atlantic salmon/i }).click()
    let modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByRole('button', { name: /edit/i })).not.toBeVisible()
    await expect(modal.getByRole('button', { name: /delete/i })).not.toBeVisible()
    await modal.getByRole('button', { name: /close/i }).click()

    // Own product (owner_id = 42 = SESSION.accountId) — edit/delete visible
    await page.getByRole('button', { name: /view greek yogurt/i }).click()
    modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByRole('button', { name: /edit/i })).toBeVisible()
    await expect(modal.getByRole('button', { name: /delete/i })).toBeVisible()
  })

  // ── AC-033: add product ────────────────────────────────────────────────────

  test('AC-033: adding a product via form adds it to the catalog', async ({ page }) => {
    // Mock POST /products
    await page.route('**/products', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(NEW_PRODUCT),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('/products')
    await waitForShell(page)

    // Open add form
    await page.getByRole('button', { name: /add product/i }).click()

    const dialog = page.getByRole('dialog', { name: /add product/i })
    await expect(dialog).toBeVisible()

    // Fill in required fields
    await dialog.getByLabelText(/product name/i).fill('Hemp seeds')
    await dialog.getByPlaceholder(/e.g. Dairy/i).fill('Nuts')
    await dialog.getByLabelText(/calories/i).fill('166')
    await dialog.getByLabelText(/protein/i).fill('9.5')
    await dialog.getByLabelText(/fat/i).fill('14.6')
    await dialog.getByLabelText(/carbs/i).fill('2.6')

    await dialog.getByRole('button', { name: /add product/i }).click()

    // Modal should close and detail modal for new product should open
    await expect(page.getByRole('dialog', { name: /hemp seeds/i })).toBeVisible({
      timeout: 8_000,
    })
  })

  // ── AC-043/044: week flag toggle ───────────────────────────────────────────

  test('AC-043/044: week flag toggle sends PUT request to backend', async ({ page }) => {
    const updatedProduct = { ...PRODUCTS[0], week_flag: { flag: 'this_week' } }

    await page.route('**/products/1/week-flag', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updatedProduct),
      })
    )

    await page.goto('/products')
    await waitForShell(page)

    await page.getByRole('button', { name: /list/i }).click()
    await expect(page.getByText('Atlantic salmon')).toBeVisible({ timeout: 8_000 })

    await page.getByRole('button', { name: /view atlantic salmon/i }).click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Click "This week"
    await modal.getByRole('button', { name: /this week/i }).click()

    // The "This week" button should become active (aria-pressed=true)
    await expect(modal.getByRole('button', { name: /this week/i })).toHaveAttribute(
      'aria-pressed',
      'true',
      { timeout: 5_000 }
    )
  })

  // ── AC-028: diet tag filter ────────────────────────────────────────────────

  test('AC-028: diet tag multi-select filters the list', async ({ page }) => {
    await page.goto('/products')
    await waitForShell(page)

    await page.getByRole('button', { name: /list/i }).click()
    await expect(page.getByText('Atlantic salmon')).toBeVisible({ timeout: 8_000 })

    // Open diet tags dropdown
    await page.getByRole('button', { name: /diet tags/i }).click()

    // Select "keto" tag
    await page.getByRole('checkbox', { name: /keto/i }).check()

    // Only keto products should be shown: Atlantic salmon
    await expect(page.getByText('Atlantic salmon')).toBeVisible()
    // Greek yogurt has protein-focused + mediterranean, not keto
    await expect(page.getByText('Greek yogurt')).not.toBeVisible()
  })
})
