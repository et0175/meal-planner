/**
 * Typed fetch wrappers for the Catalog service.
 * Base URL: NEXT_PUBLIC_CATALOG_URL
 *
 * Never call fetch directly in components — use these wrappers.
 */

const BASE_URL = process.env.NEXT_PUBLIC_CATALOG_URL ?? ''

// ── Types ──────────────────────────────────────────────────────────────────

export interface Nutrition {
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
}

export interface ProductUnit {
  id: number
  unit_name: string
  grams_per_unit: number
}

export type WeekFlagValue = 'this_week' | 'next_week' | 'none'

export interface Product {
  id: number
  name: string
  category: string
  diet_tags: string[]
  owner_id: number | null
  is_deleted: boolean
  nutrition: Nutrition
  units: ProductUnit[]
  week_flag?: { flag: WeekFlagValue } | null
}

export interface ProductsQuery {
  category?: string
  q?: string
  sort_by?: 'name' | 'category' | 'calories' | 'protein_g' | 'fat_g' | 'carbs_g'
  order?: 'asc' | 'desc'
  week_flag?: 'this_week' | 'next_week'
  user_id?: number
  limit?: number
  offset?: number
}

export interface CreateProductBody {
  name: string
  category: string
  diet_tags: string[]
  nutrition: Nutrition
  units: Array<{ unit_name: string; grams_per_unit: number }>
}

export type UpdateProductBody = Partial<CreateProductBody>

export interface CatalogApiError {
  status: number
  detail: string
}

export function isCatalogApiError(err: unknown): err is CatalogApiError {
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
  throw { status: res.status, detail } as CatalogApiError
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function getProducts(token: string, query: ProductsQuery = {}): Promise<Product[]> {
  if (!BASE_URL) return []
  const params = new URLSearchParams()
  if (query.category) params.set('category', query.category)
  if (query.q) params.set('search', query.q)
  if (query.sort_by) params.set('sort_by', query.sort_by)
  if (query.order) params.set('order', query.order)
  if (query.week_flag) params.set('week_flag', query.week_flag)
  if (query.user_id !== undefined) params.set('user_id', String(query.user_id))
  if (query.limit !== undefined) params.set('limit', String(query.limit))
  if (query.offset !== undefined) params.set('offset', String(query.offset))
  const qs = params.toString()
  const res = await fetch(`${BASE_URL}/products${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await handleResponse<{ items: Product[] }>(res)
  return data.items
}

export async function getProduct(token: string, id: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return handleResponse<Product>(res)
}

export async function createProduct(token: string, body: CreateProductBody): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  return handleResponse<Product>(res)
}

export async function updateProduct(
  token: string,
  id: number,
  body: UpdateProductBody
): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  return handleResponse<Product>(res)
}

export async function deleteProduct(token: string, id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    await handleResponse<void>(res)
  }
}

export async function setWeekFlag(
  token: string,
  id: number,
  flag: WeekFlagValue
): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}/week-flag`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ flag }),
  })
  return handleResponse<Product>(res)
}
