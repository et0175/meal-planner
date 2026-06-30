'use client'

/**
 * Shopping list page — CARD-008.
 *
 * Loads GET /shopping on mount (auto-generates for current ISO week).
 * Date range picker → POST /shopping/generate.
 * Stale banner → POST /shopping/refresh.
 * PDF button → POST /shopping/export/pdf → browser print dialog.
 *
 * useReducer for async state (avoids react-hooks/set-state-in-effect).
 *
 * AC-070: navigate to screen → list shown immediately
 * AC-071: no assignments → empty state shown
 * AC-072: custom range applied → list reflects range
 * AC-073: from > to → client-side validation error (handled in DateRangePicker)
 * AC-075: is_stale=true → stale banner shown
 * AC-076: "Refresh" → banner hidden on success
 * AC-077: "Download PDF" → print dialog opens within 3 s
 * AC-120: empty list → empty-list PDF (no error)
 */

import { useEffect, useReducer } from 'react'
import { FileDown } from 'lucide-react'
import {
  getShoppingList,
  generateShoppingList,
  refreshShoppingList,
  exportShoppingPdf,
  type ShoppingList,
} from '@/lib/api/shopping'
import { getStoredToken } from '@/lib/hooks/useAuth'
import { currentIsoWeek, isoWeekToMonday, isoDate } from '@/lib/utils/week'
import { Button } from '@/components/ui/Button'
import { DateRangePicker } from '@/shopping/DateRangePicker'
import { ShoppingListView } from '@/shopping/ShoppingListView'
import { StalenessBanner } from '@/shopping/StalenessBanner'
import { PlanSummaryPanel } from '@/shopping/PlanSummaryPanel'

// ── Async state ────────────────────────────────────────────────────────────

interface PageState {
  isLoading: boolean
  isGenerating: boolean
  isRefreshing: boolean
  isPdfLoading: boolean
  error: string | null
  list: ShoppingList | null
}

type PageAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; list: ShoppingList | null }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; list: ShoppingList }
  | { type: 'GENERATE_ERROR'; error: string }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; list: ShoppingList }
  | { type: 'REFRESH_ERROR' }
  | { type: 'PDF_START' }
  | { type: 'PDF_DONE' }

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, error: null, list: action.list }
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.error }
    case 'GENERATE_START':
      return { ...state, isGenerating: true, error: null }
    case 'GENERATE_SUCCESS':
      return { ...state, isGenerating: false, error: null, list: action.list }
    case 'GENERATE_ERROR':
      return { ...state, isGenerating: false, error: action.error }
    case 'REFRESH_START':
      return { ...state, isRefreshing: true }
    case 'REFRESH_SUCCESS':
      return { ...state, isRefreshing: false, list: action.list }
    case 'REFRESH_ERROR':
      return { ...state, isRefreshing: false }
    case 'PDF_START':
      return { ...state, isPdfLoading: true }
    case 'PDF_DONE':
      return { ...state, isPdfLoading: false }
    default:
      return state
  }
}

// ── Fallback date range (current ISO week Mon–Sun) ─────────────────────────

function currentWeekRange(): { fromDate: string; toDate: string } {
  const monday = isoWeekToMonday(currentIsoWeek())
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return { fromDate: isoDate(monday), toDate: isoDate(sunday) }
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ShoppingPage() {
  const [state, dispatch] = useReducer(pageReducer, {
    isLoading: true,
    isGenerating: false,
    isRefreshing: false,
    isPdfLoading: false,
    error: null,
    list: null,
  })

  // ── Initial fetch on mount ─────────────────────────────────────────────

  useEffect(() => {
    const token = getStoredToken()
    if (!token) return
    dispatch({ type: 'FETCH_START' })
    getShoppingList(token)
      .then((list) => {
        dispatch({ type: 'FETCH_SUCCESS', list })
      })
      .catch(() => {
        dispatch({
          type: 'FETCH_ERROR',
          error: 'Failed to load shopping list. Please try again.',
        })
      })
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────

  function handleGenerate(fromDate: string, toDate: string) {
    const token = getStoredToken()
    if (!token) return
    dispatch({ type: 'GENERATE_START' })
    generateShoppingList(token, fromDate, toDate)
      .then((list) => {
        dispatch({ type: 'GENERATE_SUCCESS', list })
      })
      .catch(() => {
        dispatch({ type: 'GENERATE_ERROR', error: 'Failed to generate shopping list.' })
      })
  }

  function handleRefresh() {
    const token = getStoredToken()
    if (!token) return
    dispatch({ type: 'REFRESH_START' })
    refreshShoppingList(token)
      .then((list) => {
        dispatch({ type: 'REFRESH_SUCCESS', list })
      })
      .catch(() => {
        dispatch({ type: 'REFRESH_ERROR' })
      })
  }

  function handleDownloadPdf() {
    const token = getStoredToken()
    if (!token) return
    const { fromDate, toDate } = currentWeekRange()
    const from = state.list?.from_date ?? fromDate
    const to = state.list?.to_date ?? toDate
    dispatch({ type: 'PDF_START' })
    exportShoppingPdf(token, from, to)
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        const win = window.open(url)
        if (win) {
          win.onload = () => {
            win.print()
            URL.revokeObjectURL(url)
          }
        }
        dispatch({ type: 'PDF_DONE' })
      })
      .catch(() => {
        dispatch({ type: 'PDF_DONE' })
      })
  }

  // ── Retry handler (in error state) ────────────────────────────────────

  function handleRetry() {
    const token = getStoredToken()
    if (!token) return
    dispatch({ type: 'FETCH_START' })
    getShoppingList(token)
      .then((list) => {
        dispatch({ type: 'FETCH_SUCCESS', list })
      })
      .catch(() => {
        dispatch({
          type: 'FETCH_ERROR',
          error: 'Failed to load shopping list. Please try again.',
        })
      })
  }

  // ── Loading state ──────────────────────────────────────────────────────

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center py-24" role="status" aria-live="polite">
        <span className="sr-only">Loading shopping list…</span>
        <span
          className="h-8 w-8 animate-spin rounded-full border-4 border-teal-700 border-t-transparent"
          aria-hidden="true"
        />
      </div>
    )
  }

  // ── Error state (initial fetch failed, no list available) ─────────────

  if (state.error && !state.list) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600 text-sm">{state.error}</p>
        <Button variant="ghost" size="sm" onClick={handleRetry}>
          Retry
        </Button>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Toolbar: date range picker + PDF download */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <DateRangePicker isLoading={state.isGenerating} onGenerate={handleGenerate} />
        <Button
          variant="ghost"
          size="sm"
          isLoading={state.isPdfLoading}
          onClick={handleDownloadPdf}
          aria-label="Download shopping list as PDF"
        >
          <FileDown size={15} aria-hidden="true" />
          Download PDF
        </Button>
      </div>

      {/* Inline error from generate */}
      {state.error && state.list && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
          role="alert"
        >
          {state.error}
        </div>
      )}

      {/* Plan summary + stale banner */}
      {state.list && (
        <>
          <PlanSummaryPanel list={state.list} />
          {state.list.is_stale && (
            <StalenessBanner isRefreshing={state.isRefreshing} onRefresh={handleRefresh} />
          )}
        </>
      )}

      {/* Grouped shopping list */}
      <ShoppingListView items={state.list?.items ?? []} />
    </div>
  )
}
