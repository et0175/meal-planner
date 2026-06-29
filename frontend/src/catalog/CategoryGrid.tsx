/**
 * CategoryGrid — grid of category cards for the default "browse by category" view.
 *
 * Derives categories and per-category counts from the full product list.
 * Clicking a card fires onCategorySelect which switches to the list view
 * pre-filtered to that category.
 *
 * AC-024: card view → category cards; clicking reveals that category's products
 */

import type { Product } from '@/lib/api/catalog'
import { cn } from '@/lib/utils/cn'

interface CategoryGridProps {
  products: Product[]
  onCategorySelect: (category: string) => void
}

// Colour palette for known category names; falls back to a neutral style.
const CATEGORY_STYLES: Record<string, string> = {
  Dairy: 'bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-100',
  Fish: 'bg-cyan-50 text-cyan-800 border-cyan-100 hover:bg-cyan-100',
  Meat: 'bg-red-50 text-red-800 border-red-100 hover:bg-red-100',
  Grains: 'bg-amber-50 text-amber-800 border-amber-100 hover:bg-amber-100',
  Produce: 'bg-green-50 text-green-800 border-green-100 hover:bg-green-100',
  Legumes: 'bg-lime-50 text-lime-800 border-lime-100 hover:bg-lime-100',
  'Nuts & Seeds': 'bg-orange-50 text-orange-800 border-orange-100 hover:bg-orange-100',
  Condiments: 'bg-yellow-50 text-yellow-800 border-yellow-100 hover:bg-yellow-100',
}

const DEFAULT_STYLE = 'bg-gray-50 text-gray-800 border-gray-100 hover:bg-gray-100'

export function CategoryGrid({ products, onCategorySelect }: CategoryGridProps) {
  // Aggregate product counts per category
  const categoryMap = new Map<string, number>()
  for (const product of products) {
    categoryMap.set(product.category, (categoryMap.get(product.category) ?? 0) + 1)
  }

  const categories = Array.from(categoryMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-400 text-sm">No products available.</p>
        <p className="text-gray-300 text-xs mt-1">Add a product to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map(([category, count]) => {
        const style = CATEGORY_STYLES[category] ?? DEFAULT_STYLE
        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategorySelect(category)}
            className={cn(
              'flex flex-col items-start p-5 rounded-2xl border text-left',
              'transition-all hover:shadow-md hover:-translate-y-0.5',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
              style
            )}
          >
            <span className="font-semibold text-base">{category}</span>
            <span className="text-xs mt-1.5 opacity-70">
              {count} {count === 1 ? 'product' : 'products'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
