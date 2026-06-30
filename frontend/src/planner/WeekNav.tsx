'use client'

/**
 * WeekNav — week navigation header.
 *
 * AC-046: "Next week" → following week loaded
 * AC-047: "Today" → returns to current week
 * AC-113: on current week → "Today" button highlighted
 * AC-060: diet label shown in header when diet preference is set
 * AC-061: no diet → no label (no error)
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatWeekLabel } from '@/lib/utils/week'

interface WeekNavProps {
  week: string
  isCurrentWeek: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  dietLabel?: string | null
}

export function WeekNav({ week, isCurrentWeek, onPrev, onNext, onToday, dietLabel }: WeekNavProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous week"
          className={cn(
            'p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'
          )}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <span
          className="text-sm font-semibold text-gray-900 text-center"
          style={{ minWidth: '13rem' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {formatWeekLabel(week)}
        </span>

        <button
          type="button"
          onClick={onNext}
          aria-label="Next week"
          className={cn(
            'p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'
          )}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={onToday}
        aria-current={isCurrentWeek ? 'date' : undefined}
        className={cn(
          'px-3 py-1.5 text-xs font-medium rounded-xl border cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
          isCurrentWeek
            ? 'bg-teal-700 text-white border-teal-700'
            : 'bg-white text-teal-700 border-teal-300 hover:bg-teal-50'
        )}
      >
        Today
      </button>

      {dietLabel && (
        <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full">
          {dietLabel}
        </span>
      )}
    </div>
  )
}
