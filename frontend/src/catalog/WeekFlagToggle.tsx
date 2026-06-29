'use client'

/**
 * WeekFlagToggle — buttons to set None / This week / Next week.
 *
 * ADR-0009: calls the backend immediately on selection.
 * No optimistic update — button is disabled while the request is in flight.
 * Error is shown inline below the buttons.
 *
 * AC-043: set "This week" → product surfaces in planner
 * AC-044: clear flag → removed from planner summary
 */

import { useState } from 'react'
import type { Product, WeekFlagValue } from '@/lib/api/catalog'
import { setWeekFlag } from '@/lib/api/catalog'
import { cn } from '@/lib/utils/cn'

interface WeekFlagToggleProps {
  product: Product
  token: string
  onUpdated: (updated: Product) => void
}

const OPTIONS: { value: WeekFlagValue; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'this_week', label: 'This week' },
  { value: 'next_week', label: 'Next week' },
]

export function WeekFlagToggle({ product, token, onUpdated }: WeekFlagToggleProps) {
  const currentFlag = product.week_flag?.flag ?? 'none'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSelect(flag: WeekFlagValue) {
    if (flag === currentFlag || isLoading) return
    setIsLoading(true)
    setError(null)
    setWeekFlag(token, product.id, flag)
      .then((updated) => {
        setIsLoading(false)
        onUpdated(updated)
      })
      .catch(() => {
        setIsLoading(false)
        setError('Failed to update. Please try again.')
      })
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1.5">Week flag</p>
      <div className="flex gap-1.5" role="group" aria-label="Week flag selection">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={isLoading}
            onClick={() => handleSelect(opt.value)}
            aria-pressed={currentFlag === opt.value}
            className={cn(
              'px-3 py-1.5 text-xs rounded-lg font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
              'disabled:cursor-not-allowed disabled:opacity-60',
              currentFlag === opt.value
                ? 'bg-teal-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {isLoading && (
        <p className="text-xs text-gray-400 mt-1.5" aria-live="polite">
          Saving…
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
