/**
 * Typed fetch wrappers for the Shopping service.
 * Base URL: NEXT_PUBLIC_SHOPPING_URL
 *
 * Never call fetch directly in components — use these wrappers.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SHOPPING_URL ?? ''

// ── Types ──────────────────────────────────────────────────────────────────

export interface ShoppingItem {
  product_id: number
  product_name: string
  category: string
  total_quantity: number
  unit: string
}

export interface ShoppingList {
  id: number
  user_id: number
  generated_at: string
  from_date: string // "YYYY-MM-DD"
  to_date: string // "YYYY-MM-DD"
  is_stale: boolean
  items: ShoppingItem[]
}

export interface ShoppingApiError {
  status: number
  detail: string
}

export function isShoppingApiError(err: unknown): err is ShoppingApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'detail' in err
}

// ── Internal helpers ───────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>
  }
  let detail = 'An unexpected error occurred.'
  try {
    const body = (await res.json()) as { detail?: string }
    if (body.detail) detail = body.detail
  } catch {
    // non-JSON body — keep default message
  }
  throw { status: res.status, detail } as ShoppingApiError
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * GET /shopping — auto-generates for current ISO week if no list exists.
 * Returns null when the service is unavailable or returns 404.
 *
 * AC-070: navigate to screen with assignments → list shown immediately
 * AC-071: no assignments → empty items array
 */
export async function getShoppingList(token: string): Promise<ShoppingList | null> {
  if (!BASE_URL) return null
  const res = await fetch(`${BASE_URL}/shopping`, {
    headers: authHeader(token),
  })
  if (res.status === 404) return null
  return handleResponse<ShoppingList>(res)
}

/**
 * POST /shopping/generate — generate list for an explicit date range.
 *
 * AC-072: set custom range → list reflects only that range
 */
export async function generateShoppingList(
  token: string,
  from_date: string,
  to_date: string
): Promise<ShoppingList> {
  const res = await fetch(`${BASE_URL}/shopping/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ from_date, to_date }),
  })
  return handleResponse<ShoppingList>(res)
}

/**
 * POST /shopping/refresh — regenerate from current plan; clears stale flag.
 *
 * AC-076: "Refresh" → list regenerated, banner hidden
 */
export async function refreshShoppingList(token: string): Promise<ShoppingList> {
  const res = await fetch(`${BASE_URL}/shopping/refresh`, {
    method: 'POST',
    headers: authHeader(token),
  })
  return handleResponse<ShoppingList>(res)
}

/**
 * POST /shopping/export/pdf — returns binary PDF blob.
 *
 * AC-077: "Download PDF" → print dialog opens within 3 s
 * AC-120: empty list → empty-list PDF (no error)
 */
export async function exportShoppingPdf(
  token: string,
  from_date: string,
  to_date: string
): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/shopping/export/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ from_date, to_date }),
  })
  if (!res.ok) await handleResponse<Blob>(res)
  return res.blob()
}
