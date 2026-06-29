'use client'

/**
 * Topbar — shows current module name and week-stats widget when on Planner.
 *
 * AC-022: any authenticated module → topbar shows current module name
 * AC-023: Meal Planner → topbar shows at-a-glance week stats
 * AC-110: Meal Planner, no assignments → topbar shows zero-state (no error)
 *
 * ADR-0004: calls GET /plan/summary?week={ISO_WEEK}
 * Returns zero-state (0 meals, 0 kcal) when planning service unavailable.
 */

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CalendarDays, Apple } from 'lucide-react'
import { getPlanSummary, type PlanSummary } from '@/lib/api/planning'
import { getStoredToken } from '@/lib/hooks/useAuth'

/** ISO week string: e.g. "2026-W26" */
function currentIsoWeek(): string {
  const now = new Date()
  // Thursday-in-current-week method (ISO 8601)
  const tmp = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  // Set to nearest Thursday
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

const MODULE_LABELS: Record<string, string> = {
  '/planner': 'Planner',
  '/products': 'Products',
  '/shopping': 'Shopping list',
}

function getModuleLabel(pathname: string): string {
  for (const [prefix, label] of Object.entries(MODULE_LABELS)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return label
  }
  return ''
}

const ZERO_STATE: PlanSummary = { total_assignments: 0, total_kcal: 0, week: '' }

export function Topbar() {
  const pathname = usePathname()
  const moduleLabel = getModuleLabel(pathname)
  const isPlanner = pathname === '/planner' || pathname.startsWith('/planner/')

  const [summary, setSummary] = useState<PlanSummary>(ZERO_STATE)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!isPlanner) return
    const token = getStoredToken()
    if (!token) return

    const controller = new AbortController()
    const week = currentIsoWeek()
    getPlanSummary(token, week, controller.signal)
      .then((data) => {
        if (isMounted.current) setSummary(data)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        // Other errors: getPlanSummary already returns ZERO_STATE internally
      })

    return () => controller.abort()
  }, [isPlanner, pathname])

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      <h1 className="text-base font-semibold text-gray-900 flex-1">{moduleLabel}</h1>

      {isPlanner && (
        <div
          className="flex items-center gap-4 text-sm text-gray-600"
          role="group"
          aria-label="Week summary"
        >
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} aria-hidden="true" />
            <strong className="text-gray-700">{summary.total_assignments}</strong> planned
          </span>
          <span className="flex items-center gap-1.5">
            <Apple size={13} aria-hidden="true" />
            <strong className="text-gray-700">{Math.round(summary.total_kcal)}</strong> kcal
          </span>
        </div>
      )}
    </header>
  )
}
