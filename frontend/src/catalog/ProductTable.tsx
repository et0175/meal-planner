'use client'

/**
 * ProductTable — sortable list/table view for products.
 *
 * Columns: name, category, diet tags, kcal/100g, protein, fat, carbs.
 * Clicking a column header triggers onSortChange.
 * Clicking a row opens the product detail modal via onProductClick.
 * Shows an empty state when the products array is empty.
 *
 * AC-025: table with nutrition columns
 * AC-026: no products → empty state
 * AC-031: sort by column → ordered list
 */

import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Product } from '@/lib/api/catalog'
import type { FilterState } from './FilterBar'
import { cn } from '@/lib/utils/cn'

type SortableCol = FilterState['sortBy']

interface ProductTableProps {
  products: Product[]
  sortBy: SortableCol
  sortOrder: FilterState['sortOrder']
  onSortChange: (col: SortableCol) => void
  onProductClick: (product: Product) => void
}

const COLUMNS: { key: SortableCol; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'calories', label: 'kcal/100 g' },
  { key: 'protein_g', label: 'Protein g' },
  { key: 'fat_g', label: 'Fat g' },
  { key: 'carbs_g', label: 'Carbs g' },
]

function DietTagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-block px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-medium mr-1 mb-0.5">
      {tag}
    </span>
  )
}

export function ProductTable({
  products,
  sortBy,
  sortOrder,
  onSortChange,
  onProductClick,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-400 text-sm">No products match your filters.</p>
        <p className="text-gray-300 text-xs mt-1">Try adjusting the search or filters above.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-sm" aria-label="Product list">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-xs font-medium text-gray-500 text-left',
                  'cursor-pointer hover:text-gray-700 select-none whitespace-nowrap'
                )}
                onClick={() => onSortChange(col.key)}
                aria-sort={
                  sortBy === col.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'
                }
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {sortBy === col.key ? (
                    sortOrder === 'asc' ? (
                      <ChevronUp size={12} aria-hidden="true" />
                    ) : (
                      <ChevronDown size={12} aria-hidden="true" />
                    )
                  ) : null}
                </span>
              </th>
            ))}
            <th scope="col" className="px-4 py-3 text-xs font-medium text-gray-500 text-left">
              Diet tags
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onProductClick(product)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onProductClick(product)
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View ${product.name}`}
            >
              <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
              <td className="px-4 py-3 text-gray-600">{product.category}</td>
              <td className="px-4 py-3 text-gray-700 tabular-nums">{product.nutrition.calories}</td>
              <td className="px-4 py-3 text-gray-700 tabular-nums">
                {product.nutrition.protein_g}
              </td>
              <td className="px-4 py-3 text-gray-700 tabular-nums">{product.nutrition.fat_g}</td>
              <td className="px-4 py-3 text-gray-700 tabular-nums">{product.nutrition.carbs_g}</td>
              <td className="px-4 py-3">
                {product.diet_tags.slice(0, 3).map((tag) => (
                  <DietTagBadge key={tag} tag={tag} />
                ))}
                {product.diet_tags.length > 3 && (
                  <span className="text-xs text-gray-400">+{product.diet_tags.length - 3}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
