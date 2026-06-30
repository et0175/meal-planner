'use client'

/**
 * StalenessBanner — displayed when shopping list has is_stale = true.
 *
 * AC-075: plan changes → stale banner appears
 * AC-076: "Refresh" clicked → list regenerated, banner hidden on success
 */

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface StalenessBannerProps {
  /** Whether a refresh request is in-flight. */
  isRefreshing: boolean
  /** Called when the user clicks "Refresh". */
  onRefresh: () => void
}

export function StalenessBanner({ isRefreshing, onRefresh }: StalenessBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-amber-500 shrink-0" aria-hidden="true" />
        <span className="text-sm text-amber-800">
          Plan changed — refresh to update your shopping list.
        </span>
      </div>
      <Button size="sm" variant="ghost" isLoading={isRefreshing} onClick={onRefresh}>
        Refresh
      </Button>
    </div>
  )
}
