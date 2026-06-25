/**
 * Typed fetch wrappers for the Planning service.
 * Base URL: NEXT_PUBLIC_PLANNING_URL
 *
 * The planning service is not yet implemented (Increment 3).
 * getPlanSummary returns a zero-state when the endpoint is unavailable.
 */

const BASE_URL = process.env.NEXT_PUBLIC_PLANNING_URL ?? ''

export interface PlanSummary {
  total_assignments: number
  total_kcal: number
  week: string
}

const ZERO_STATE: PlanSummary = {
  total_assignments: 0,
  total_kcal: 0,
  week: '',
}

export async function getPlanSummary(token: string, week: string): Promise<PlanSummary> {
  if (!BASE_URL) return ZERO_STATE
  try {
    const res = await fetch(`${BASE_URL}/plan/summary?week=${encodeURIComponent(week)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return ZERO_STATE
    const data = (await res.json()) as Partial<PlanSummary>
    return {
      total_assignments: data.total_assignments ?? 0,
      total_kcal: data.total_kcal ?? 0,
      week: data.week ?? week,
    }
  } catch {
    return ZERO_STATE
  }
}
