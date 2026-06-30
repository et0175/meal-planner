'use client'

/**
 * Planner page — meal planning UI (CARD-006).
 *
 * AC-021: authenticated user navigates to "/" → Meal Planner screen rendered
 * AC-023: Meal Planner → topbar shows at-a-glance week stats (handled by Topbar)
 * FR-016 → FR-026: week nav, summary grid, calendar, nutrition, log, PDF export
 */

import { useEffect, useReducer, useState, useRef } from 'react'
import { CalendarDays, Table2, Download, BookmarkCheck, Loader2, X } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { WeekNav } from '@/planner/WeekNav'
import { WeekSummaryGrid } from '@/planner/WeekSummaryGrid'
import { CalendarView } from '@/planner/CalendarView'
import { PlanSummaryPanel } from '@/planner/PlanSummaryPanel'
import {
  getPlanAssignments,
  getNutritionTarget,
  logWeek,
  exportPdf,
  type Assignment,
  type NutritionTarget,
} from '@/lib/api/planning'
import { currentIsoWeek, prevWeek, nextWeek } from '@/lib/utils/week'

// ── Async state helpers ───────────────────────────────────────────────────────

type AssignmentState =
  | { status: 'loading' }
  | { status: 'success'; data: Assignment[] }
  | { status: 'error'; message: string }

type AssignmentAction =
  | { type: 'LOAD' }
  | { type: 'SUCCESS'; data: Assignment[] }
  | { type: 'ERROR'; message: string }

function assignmentReducer(_prev: AssignmentState, action: AssignmentAction): AssignmentState {
  switch (action.type) {
    case 'LOAD':
      return { status: 'loading' }
    case 'SUCCESS':
      return { status: 'success', data: action.data }
    case 'ERROR':
      return { status: 'error', message: action.message }
    default:
      return _prev
  }
}

// ── Tab type ──────────────────────────────────────────────────────────────────

type Tab = 'summary' | 'calendar'

// ── Log feedback ──────────────────────────────────────────────────────────────

interface LogFeedback {
  message: string
  type: 'success' | 'error'
}

// ── Page component ────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const { session } = useAuth()
  const [week, setWeek] = useState(currentIsoWeek)
  const [activeTab, setActiveTab] = useState<Tab>('summary')
  const [assignmentState, dispatchAssignment] = useReducer(assignmentReducer, {
    status: 'loading',
  })
  const [target, setTarget] = useState<NutritionTarget | null>(null)
  const [logFeedback, setLogFeedback] = useState<LogFeedback | null>(null)
  const [loggingWeek, setLoggingWeek] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isCurrentWeek = week === currentIsoWeek()

  // ── Fetch assignments when week or session changes ────────────────────────

  function fetchAssignments() {
    if (!session?.token || !session.accountId) return
    dispatchAssignment({ type: 'LOAD' })
    getPlanAssignments(session.token, week, session.accountId)
      .then((data) => dispatchAssignment({ type: 'SUCCESS', data }))
      .catch((err: unknown) => {
        const msg =
          typeof err === 'object' && err !== null && 'detail' in err
            ? String((err as { detail: unknown }).detail)
            : 'Failed to load assignments.'
        dispatchAssignment({ type: 'ERROR', message: msg })
      })
  }

  useEffect(() => {
    if (!session) return
    fetchAssignments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week, session?.token])

  // ── Fetch nutrition target once (on mount / session ready) ─────────────────

  useEffect(() => {
    if (!session?.token) return
    getNutritionTarget(session.token)
      .then((t) => setTarget(t))
      .catch(() => setTarget(null))
  }, [session?.token])

  // ── Show log feedback with auto-dismiss ────────────────────────────────────

  function showFeedback(message: string, type: LogFeedback['type'] = 'success') {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    setLogFeedback({ message, type })
    feedbackTimerRef.current = setTimeout(() => setLogFeedback(null), 3000)
  }

  // ── Log week ───────────────────────────────────────────────────────────────

  async function handleLogWeek() {
    if (!session?.token) return
    setLoggingWeek(true)
    try {
      await logWeek(session.token, week)
      showFeedback('Week logged successfully.')
    } catch {
      showFeedback('Failed to log week.', 'error')
    } finally {
      setLoggingWeek(false)
    }
  }

  // ── Export PDF ─────────────────────────────────────────────────────────────

  async function handleExportPdf() {
    if (!session?.token) return
    setExportingPdf(true)
    try {
      const blob = await exportPdf(session.token, week)
      const url = URL.createObjectURL(blob)
      const win = window.open(url)
      if (win) {
        win.onload = () => {
          win.print()
          URL.revokeObjectURL(url)
        }
      }
    } catch {
      showFeedback('Failed to export PDF.', 'error')
    } finally {
      setExportingPdf(false)
    }
  }

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (!session) return null

  const assignments = assignmentState.status === 'success' ? assignmentState.data : []

  return (
    <div className="space-y-4">
      {/* Header: week navigation + actions */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <WeekNav
          week={week}
          isCurrentWeek={isCurrentWeek}
          onPrev={() => setWeek(prevWeek(week))}
          onNext={() => setWeek(nextWeek(week))}
          onToday={() => setWeek(currentIsoWeek())}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogWeek}
            disabled={loggingWeek}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {loggingWeek ? (
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
            ) : (
              <BookmarkCheck size={13} aria-hidden="true" />
            )}
            Log week
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {exportingPdf ? (
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
            ) : (
              <Download size={13} aria-hidden="true" />
            )}
            Export PDF
          </button>
        </div>
      </div>

      {/* Log feedback toast */}
      {logFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm ${
            logFeedback.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <span>{logFeedback.message}</span>
          <button
            type="button"
            onClick={() => setLogFeedback(null)}
            aria-label="Dismiss notification"
            className="text-current opacity-60 hover:opacity-100 cursor-pointer focus-visible:outline-none"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Tab navigation */}
      <div
        className="flex border-b border-gray-200 gap-1"
        role="tablist"
        aria-label="Planner views"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'summary'}
          aria-controls="tab-panel-summary"
          id="tab-summary"
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
            activeTab === 'summary'
              ? 'border-teal-700 text-teal-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Table2 size={14} aria-hidden="true" />
          Week Summary
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'calendar'}
          aria-controls="tab-panel-calendar"
          id="tab-calendar"
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
            activeTab === 'calendar'
              ? 'border-teal-700 text-teal-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <CalendarDays size={14} aria-hidden="true" />
          Calendar
        </button>
      </div>

      {/* Loading state */}
      {assignmentState.status === 'loading' && (
        <div className="flex items-center justify-center py-16" role="status">
          <span className="sr-only">Loading meal plan…</span>
          <Loader2 size={32} className="animate-spin text-teal-400" aria-hidden="true" />
        </div>
      )}

      {/* Error state */}
      {assignmentState.status === 'error' && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
        >
          <span>{assignmentState.message}</span>
          <button
            type="button"
            onClick={fetchAssignments}
            className="text-red-700 underline text-xs hover:no-underline cursor-pointer focus-visible:outline-none"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tab panels */}
      {assignmentState.status === 'success' && (
        <>
          {/* Week Summary tab */}
          <div
            id="tab-panel-summary"
            role="tabpanel"
            aria-labelledby="tab-summary"
            hidden={activeTab !== 'summary'}
          >
            <WeekSummaryGrid
              assignments={assignments}
              week={week}
              target={target}
              token={session.token}
              onRefresh={fetchAssignments}
            />
          </div>

          {/* Calendar tab */}
          <div
            id="tab-panel-calendar"
            role="tabpanel"
            aria-labelledby="tab-calendar"
            hidden={activeTab !== 'calendar'}
          >
            <div className="space-y-4">
              <PlanSummaryPanel
                assignments={assignments}
                week={week}
                token={session.token}
                onRefresh={fetchAssignments}
              />

              <CalendarView
                assignments={assignments}
                week={week}
                target={target}
                token={session.token}
                onRefresh={fetchAssignments}
                onLogFeedback={(msg) => showFeedback(msg)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
