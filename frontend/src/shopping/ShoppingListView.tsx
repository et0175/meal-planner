'use client'

/**
 * ShoppingListView — shopping items grouped alphabetically by category.
 *
 * Each category renders as a labelled section with an item list showing
 * product name + total quantity + unit.
 *
 * AC-071: no assignments → empty state shown
 * AC-074: Oats 100 g + 50 g → Oats 150 g under Grains (aggregation handled by backend)
 * AC-119: empty plan → empty list (no error)
 */

import { ShoppingBasket } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { ShoppingItem } from '@/lib/api/shopping'

interface ShoppingListViewProps {
  items: ShoppingItem[]
}

export function ShoppingListView({ items }: ShoppingListViewProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
          <ShoppingBasket size={28} className="text-gray-300" aria-hidden="true" />
        </div>
        <p className="text-sm text-gray-500">No items in your shopping list.</p>
        <p className="text-xs text-gray-400">
          Add meals to your plan and apply a date range to generate your list.
        </p>
      </div>
    )
  }

  // Group by category, sort categories alphabetically
  const grouped = new Map<string, ShoppingItem[]>()
  for (const item of items) {
    const cat = item.category ?? 'Other'
    const group = grouped.get(cat)
    if (group) {
      group.push(item)
    } else {
      grouped.set(cat, [item])
    }
  }
  const categories = Array.from(grouped.keys()).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  )

  return (
    <section className="space-y-6" aria-label="Shopping list">
      {categories.map((cat) => {
        const catItems = grouped.get(cat)!
        return (
          <section key={cat} aria-labelledby={`cat-heading-${cat}`}>
            <h3
              id={`cat-heading-${cat}`}
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1"
            >
              {cat}
            </h3>
            <ul className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {catItems.map((item, i) => (
                <li
                  key={item.product_id}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 text-sm bg-white',
                    i > 0 && 'border-t border-gray-50'
                  )}
                >
                  <span className="font-medium text-gray-800">{item.product_name}</span>
                  <span className="text-gray-600 tabular-nums">
                    {item.total_quantity} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </section>
  )
}
