/**
 * Typed fetch wrappers for the Planning service.
 * Base URL: NEXT_PUBLIC_PLANNING_URL
 *
 * All functions return graceful fallbacks (empty arrays, zero-state objects)
 * when BASE_URL is not configured or the service is unavailable.
 *
 * ADR-0004: getPlanSummary returns zero-state when endpoint unavailable.
 */

const BASE_URL = process.env.NEXT_PUBLIC_PLANNING_URL ?? ''

// ── Types ─────────────────────────────────────────────────────────────────────

export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

export interface Assignment {
  id: number
  product_id: number
  product_name: string
  date: string // "YYYY-MM-DD"
  meal_slot: MealSlot
  quantity: number
  unit: string
  kcal_per_unit: number
  protein_per_unit: number
  fat_per_unit: number
  carbs_per_unit: number
}

export interface NutritionTarget {
  daily_kcal: number
  daily_protein_g: number
  daily_fat_g: number
  daily_carbs_g: number
}

export interface PlanSummary {
  total_assignments: number
  total_kcal: number
  week: string
}

export interface CreateAssignmentBody {
  product_id: number
  product_name: string
  date: string
  meal_slot: MealSlot
  quantity: number
  unit: string
  kcal_per_unit: number
  protein_per_unit: number
  fat_per_unit: number
  carbs_per_unit: number
}

export interface UpdateAssignmentBody {
  quantity?: number
  unit?: string
}

export interface MoveAssignmentBody {
  date: string
  meal_slot: MealSlot
}

export interface SearchProduct {
  id: number
  name: string
  category: string
  kcal_per_unit: number
  protein_per_unit: number
  fat_per_unit: number
  carbs_per_unit: number
  unit: string
}

export interface PlanningApiError {
  status: number
  detail: string
}

export function isPlanningApiError(err: unknown): err is PlanningApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'detail' in err
}

// ── Zero states ───────────────────────────────────────────────────────────────

const ZERO_SUMMARY: PlanSummary = {
  total_assignments: 0,
  total_kcal: 0,
  week: '',
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>
  }
  let detail = 'An unexpected error occurred.'
  try {
    const body = (await res.json()) as { detail?: string }
    if (body.detail) detail = body.detail
  } catch {
    // non-JSON body — keep default
  }
  throw { status: res.status, detail } as PlanningApiError
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

// ── Plan Summary ──────────────────────────────────────────────────────────────

export async function getPlanSummary(
  token: string,
  week: string,
  signal?: AbortSignal
): Promise<PlanSummary> {
  if (!BASE_URL) return ZERO_SUMMARY
  try {
    const res = await fetch(`${BASE_URL}/plan/summary?week=${encodeURIComponent(week)}`, {
      headers: authHeader(token),
      signal,
    })
    if (!res.ok) return ZERO_SUMMARY
    const data = (await res.json()) as Partial<PlanSummary>
    return {
      total_assignments: data.total_assignments ?? 0,
      total_kcal: data.total_kcal ?? 0,
      week: data.week ?? week,
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    return ZERO_SUMMARY
  }
}

// ── Assignments ───────────────────────────────────────────────────────────────

export async function getPlanAssignments(
  token: string,
  week: string,
  userId: number
): Promise<Assignment[]> {
  if (!BASE_URL) return []
  const res = await fetch(`${BASE_URL}/plan?week=${encodeURIComponent(week)}&user_id=${userId}`, {
    headers: authHeader(token),
  })
  const data = await handleResponse<{ assignments: Assignment[] }>(res)
  return data.assignments
}

export async function createAssignment(
  token: string,
  body: CreateAssignmentBody
): Promise<Assignment> {
  const res = await fetch(`${BASE_URL}/plan/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(body),
  })
  return handleResponse<Assignment>(res)
}

export async function updateAssignment(
  token: string,
  id: number,
  body: UpdateAssignmentBody
): Promise<Assignment> {
  const res = await fetch(`${BASE_URL}/plan/assignments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(body),
  })
  return handleResponse<Assignment>(res)
}

export async function deleteAssignment(token: string, id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/plan/assignments/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  })
  if (!res.ok) await handleResponse<void>(res)
}

export async function moveAssignment(
  token: string,
  id: number,
  body: MoveAssignmentBody
): Promise<Assignment> {
  const res = await fetch(`${BASE_URL}/plan/assignments/${id}/move`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(body),
  })
  return handleResponse<Assignment>(res)
}

// ── Nutrition Target ──────────────────────────────────────────────────────────

export async function getNutritionTarget(token: string): Promise<NutritionTarget | null> {
  if (!BASE_URL) return null
  try {
    const res = await fetch(`${BASE_URL}/plan/target`, { headers: authHeader(token) })
    if (res.status === 404) return null
    if (!res.ok) return null
    return res.json() as Promise<NutritionTarget>
  } catch {
    return null
  }
}

export async function updateNutritionTarget(
  token: string,
  body: NutritionTarget
): Promise<NutritionTarget> {
  const res = await fetch(`${BASE_URL}/plan/target`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(body),
  })
  return handleResponse<NutritionTarget>(res)
}

// ── Product Search ────────────────────────────────────────────────────────────

export async function searchPlanProducts(token: string, q: string): Promise<SearchProduct[]> {
  if (!BASE_URL) return []
  try {
    const res = await fetch(`${BASE_URL}/plan/search?q=${encodeURIComponent(q)}`, {
      headers: authHeader(token),
    })
    if (!res.ok) return []
    return res.json() as Promise<SearchProduct[]>
  } catch {
    return []
  }
}

// ── Log Actions ───────────────────────────────────────────────────────────────

export async function logDay(token: string, date: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/plan/log/day`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ date }),
  })
  if (!res.ok) await handleResponse<void>(res)
}

export async function logWeek(token: string, week: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/plan/log/week`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ week }),
  })
  if (!res.ok) await handleResponse<void>(res)
}

export async function logItem(token: string, assignmentId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/plan/log/item`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ assignment_id: assignmentId }),
  })
  if (!res.ok) await handleResponse<void>(res)
}

// ── PDF Export ────────────────────────────────────────────────────────────────

export async function exportPdf(token: string, week: string): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/plan/export/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ week }),
  })
  if (!res.ok) await handleResponse<Blob>(res)
  return res.blob()
}
