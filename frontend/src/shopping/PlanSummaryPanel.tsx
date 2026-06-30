'use client'

/**
 * PlanSummaryPanel — at-a-glance info row above the shopping list.
 *
 * Shows: date range, total item count, unique category count.
 */

import { Calendar, Package, Tag } from 'lucide-react'
import type { ShoppingList } from '@/lib/api/shopping'

function formatIsoDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

interface PlanSummaryPanelProps {
  list: ShoppingList
}

export function PlanSummaryPanel({ list }: PlanSummaryPanelProps) {
  const totalItems = list.items.length
  const categoryCount = new Set(list.items.map((i) => i.category ?? 'Other')).size

  return (
    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-1.5">
        <Calendar size={14} className="text-gray-400" aria-hidden="true" />
        <span>
          {formatIsoDate(list.from_date)} – {formatIsoDate(list.to_date)}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Package size={14} className="text-gray-400" aria-hidden="true" />
        <span>
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Tag size={14} className="text-gray-400" aria-hidden="true" />
        <span>
          {categoryCount} {categoryCount === 1 ? 'category' : 'categories'}
        </span>
      </div>
    </div>
  )
}
