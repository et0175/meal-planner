'use client'

/**
 * NutritionBar — horizontal progress bar for a single macro or kcal target.
 *
 * AC-063: indicators show percentage of target
 * AC-064: no target → indicators hidden (handled by parent — this component
 *          is simply not rendered when target is absent)
 */

import { cn } from '@/lib/utils/cn'

interface NutritionBarProps {
  label: string
  current: number
  target: number
  color: 'teal' | 'blue' | 'amber' | 'emerald'
  unit?: string
}

const colorMap: Record<NutritionBarProps['color'], string> = {
  teal: 'bg-teal-600',
  blue: 'bg-blue-500',
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-500',
}

export function NutritionBar({ label, current, target, color, unit = '' }: NutritionBarProps) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0
  const isOver = current > target && target > 0

  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className={cn('font-medium', isOver ? 'text-red-600' : 'text-gray-700')}>
          {Math.round(current)}/{Math.round(target)}
          {unit}
        </span>
      </div>
      <div
        className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${Math.round(current)} of ${Math.round(target)}${unit} (${Math.round(pct)}%)`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isOver ? 'bg-red-500' : colorMap[color]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
