'use client'

/**
 * DateRangePicker — date range input for shopping list generation.
 *
 * ADR-0007: defaults to current ISO week Mon–Sun, pre-filled on mount.
 * AC-073: from > to → client-side validation error shown before any API call.
 */

import { useReducer } from 'react'
import { Button } from '@/components/ui/Button'
import { currentIsoWeek, isoWeekToMonday, isoDate } from '@/lib/utils/week'

function defaultRange(): { fromDate: string; toDate: string } {
  const monday = isoWeekToMonday(currentIsoWeek())
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return { fromDate: isoDate(monday), toDate: isoDate(sunday) }
}

// ── State ──────────────────────────────────────────────────────────────────

const INITIAL = defaultRange()

interface PickerState {
  fromDate: string
  toDate: string
  error: string | null
}

type PickerAction =
  | { type: 'SET_FROM'; value: string }
  | { type: 'SET_TO'; value: string }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'CLEAR_ERROR' }

function pickerReducer(state: PickerState, action: PickerAction): PickerState {
  switch (action.type) {
    case 'SET_FROM':
      return { ...state, fromDate: action.value, error: null }
    case 'SET_TO':
      return { ...state, toDate: action.value, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.message }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

// ── Component ──────────────────────────────────────────────────────────────

interface DateRangePickerProps {
  /** Whether a generate request is in-flight. Disables the Apply button. */
  isLoading?: boolean
  /** Called with validated from/to dates when Apply is clicked. */
  onGenerate: (fromDate: string, toDate: string) => void
}

export function DateRangePicker({ isLoading = false, onGenerate }: DateRangePickerProps) {
  const [state, dispatch] = useReducer(pickerReducer, {
    fromDate: INITIAL.fromDate,
    toDate: INITIAL.toDate,
    error: null,
  })

  function handleApply() {
    if (!state.fromDate || !state.toDate) {
      dispatch({ type: 'SET_ERROR', message: 'Please fill in both date fields.' })
      return
    }
    if (state.fromDate > state.toDate) {
      dispatch({
        type: 'SET_ERROR',
        message: '"From" date must be on or before "To" date.',
      })
      return
    }
    dispatch({ type: 'CLEAR_ERROR' })
    onGenerate(state.fromDate, state.toDate)
  }

  const inputClass =
    'rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white ' +
    'focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500 ' +
    'disabled:cursor-not-allowed disabled:bg-gray-50'

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="shopping-from-date" className="text-xs font-medium text-gray-600">
          From
        </label>
        <input
          id="shopping-from-date"
          type="date"
          value={state.fromDate}
          onChange={(e) => dispatch({ type: 'SET_FROM', value: e.target.value })}
          className={inputClass}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? 'date-range-error' : undefined}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="shopping-to-date" className="text-xs font-medium text-gray-600">
          To
        </label>
        <input
          id="shopping-to-date"
          type="date"
          value={state.toDate}
          onChange={(e) => dispatch({ type: 'SET_TO', value: e.target.value })}
          className={inputClass}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? 'date-range-error' : undefined}
        />
      </div>

      <Button onClick={handleApply} isLoading={isLoading} disabled={isLoading}>
        Apply
      </Button>

      {state.error && (
        <p id="date-range-error" role="alert" className="w-full text-xs text-red-600">
          {state.error}
        </p>
      )}
    </div>
  )
}
