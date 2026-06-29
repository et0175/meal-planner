import { test, expect, type Page } from '@playwright/test'

/**
 * e2e tests for CARD-002: Navigation Shell + Auth UI.
 *
 * API calls are intercepted via page.route() — no real backend required.
 * NEXT_PUBLIC_IDENTITY_URL is empty in test env, so identity fetch calls
 * resolve as relative URLs on localhost:3001 and are matched by the glob
 * pattern used in mockAuthOk / mockAuthExpired below.
 *
 * NEXT_PUBLIC_PLANNING_URL is also empty, so getPlanSummary() returns
 * ZERO_STATE immediately without making a network request (per planning.ts).
 */

// ── fixtures ─────────────────────────────────────────────────────────────────

const SESSION = {
  token: 'test-token',
  accountId: 1,
  email: 'test@example.com',
  role: 'user',
}

const SESSION_RESPONSE = {
  account_id: 1,
  email: 'test@example.com',
  role: 'user',
}

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Injects a valid session into sessionStorage before any page scripts run.
 * Must be called before page.goto().
 */
async function injectSession(page: Page): Promise<void> {
  await page.addInitScript((session) => {
    sessionStorage.setItem('mf_session', JSON.stringify(session))
  }, SESSION)
}

/**
 * Mocks GET /auth/session to return a valid 200 response.
 * The identity service URL is empty in test env, so the request goes to
 * http://localhost:3000/auth/session and is matched by the pattern below.
 */
async function mockAuthOk(page: Page): Promise<void> {
  await page.route('**/auth/session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(SESSION_RESPONSE),
    })
  )
}

/**
 * Mocks GET /auth/session to return 401 — simulates an expired token.
 */
async function mockAuthExpired(page: Page): Promise<void> {
  await page.route('**/auth/session', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Session expired or not found' }),
    })
  )
}

// ── tests ─────────────────────────────────────────────────────────────────────

test.describe('CARD-002 Navigation Shell + Auth Guard', () => {
  /**
   * AC-018: unauthenticated request to any authenticated route → /sign-in
   */
  test('AC-018: unauthenticated request to /planner redirects to /sign-in', async ({ page }) => {
    // No sessionStorage preset — anonymous user
    await page.goto('/planner')
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 })
  })

  /**
   * AC-019: identity service returns 401 on /auth/session → token invalidated,
   * redirect to /sign-in
   */
  test('AC-019: expired token triggers /sign-in redirect', async ({ page }) => {
    await injectSession(page)
    await mockAuthExpired(page)
    await page.goto('/planner')
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 })
  })

  /**
   * AC-020: authenticated user on /planner → sidebar lists all three modules;
   * Planner link has aria-current="page"
   */
  test('AC-020: sidebar shows all modules with active-state on Planner', async ({ page }) => {
    await injectSession(page)
    await mockAuthOk(page)
    await page.goto('/planner')

    const nav = page.getByRole('navigation', { name: 'Site sections' })
    await expect(nav).toBeVisible({ timeout: 10_000 })

    await expect(nav.getByRole('link', { name: 'Planner' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Products' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Shopping list' })).toBeVisible()

    // Active state: Planner link marked as current page
    await expect(nav.getByRole('link', { name: 'Planner' })).toHaveAttribute('aria-current', 'page')
    // Other links do not carry aria-current
    await expect(nav.getByRole('link', { name: 'Products' })).not.toHaveAttribute('aria-current')
    await expect(nav.getByRole('link', { name: 'Shopping list' })).not.toHaveAttribute(
      'aria-current'
    )
  })

  /**
   * AC-108: unauthenticated request → sidebar not rendered
   * Verified on /sign-in which uses the (auth) route group with no shell.
   */
  test('AC-108: sidebar not rendered for unauthenticated user', async ({ page }) => {
    await page.goto('/sign-in')
    // The (auth) layout never mounts <Sidebar>, so the landmark is absent
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).not.toBeVisible()
  })

  /**
   * AC-021: authenticated user navigates to "/" → redirected to /planner
   */
  test('AC-021: authenticated user at / redirects to /planner', async ({ page }) => {
    await injectSession(page)
    await mockAuthOk(page)
    await page.goto('/')
    // Root page reads sessionStorage, calls router.replace('/planner')
    await expect(page).toHaveURL(/\/planner/, { timeout: 10_000 })
  })

  /**
   * AC-109: unauthenticated visitor navigates to "/" → redirected to /sign-in
   */
  test('AC-109: unauthenticated user at / redirects to /sign-in', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 })
  })

  /**
   * AC-022: topbar shows the current module name ("Planner") when on /planner
   */
  test('AC-022: topbar shows "Planner" as the module name', async ({ page }) => {
    await injectSession(page)
    await mockAuthOk(page)
    await page.goto('/planner')

    // Wait for auth to complete and shell to render
    const nav = page.getByRole('navigation', { name: 'Site sections' })
    await expect(nav).toBeVisible({ timeout: 10_000 })

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Planner')
  })

  /**
   * AC-110: Planner with no assignments (planning service absent / returns empty)
   * → topbar renders zero-state (0 planned, 0 kcal) without an error alert.
   *
   * NEXT_PUBLIC_PLANNING_URL is empty in test env, so getPlanSummary()
   * returns ZERO_STATE immediately without making a network request.
   */
  test('AC-110: Planner with no assignments shows zero-state without error', async ({ page }) => {
    await injectSession(page)
    await mockAuthOk(page)
    await page.goto('/planner')

    const nav = page.getByRole('navigation', { name: 'Site sections' })
    await expect(nav).toBeVisible({ timeout: 10_000 })

    const weekSummary = page.getByRole('group', { name: 'Week summary' })
    await expect(weekSummary).toBeVisible()

    // Zero-state values
    await expect(weekSummary).toContainText('0')
    await expect(weekSummary).toContainText('planned')
    await expect(weekSummary).toContainText('kcal')

    // No error text on the page (Next.js always injects a route-announcer
    // div[role="alert"] for screen readers, so we check content instead)
    await expect(page.locator('body')).not.toContainText('Error')
    await expect(page.locator('body')).not.toContainText('failed')
  })
})
