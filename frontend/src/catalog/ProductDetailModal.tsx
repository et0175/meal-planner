'use client'

/**
 * ProductDetailModal — full-screen overlay with product details.
 *
 * Shows:
 * - Name, category, diet tags
 * - Macro pie chart (MacroPieChart)
 * - Unit conversion table (UnitConversionTable)
 * - Week flag toggle (WeekFlagToggle)
 * - Edit / Delete buttons — only for the current user's own products
 *
 * AC-032: modal shows macro pie chart + unit conversion table
 * AC-039: edit own product → changes reflected
 * AC-040/042: edit/delete controls hidden for others' and global products
 * AC-043/044: week flag toggle
 */

import { X, Pencil, Trash2 } from 'lucide-react'
import type { Product } from '@/lib/api/catalog'
import { MacroPieChart } from './MacroPieChart'
import { UnitConversionTable } from './UnitConversionTable'
import { WeekFlagToggle } from './WeekFlagToggle'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

interface ProductDetailModalProps {
  product: Product
  token: string
  currentAccountId: number | null
  onClose: () => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onProductUpdated: (product: Product) => void
}

export function ProductDetailModal({
  product,
  token,
  currentAccountId,
  onClose,
  onEdit,
  onDelete,
  onProductUpdated,
}: ProductDetailModalProps) {
  const isOwn = product.owner_id !== null && product.owner_id === currentAccountId
  const isGlobal = product.owner_id === null

  function handleBackdropKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={handleBackdropKeyDown}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <h2 id="product-modal-title" className="text-lg font-semibold text-gray-900 truncate">
              {product.name}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{product.category}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className={cn(
              'p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'
            )}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Diet tags */}
          {product.diet_tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Diet tags</p>
              <div className="flex flex-wrap gap-1.5">
                {product.diet_tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Nutrition per 100 g</p>
            <MacroPieChart nutrition={product.nutrition} />
          </div>

          {/* Units */}
          <UnitConversionTable units={product.units} />

          {/* Week flag */}
          <WeekFlagToggle product={product} token={token} onUpdated={onProductUpdated} />

          {/* Global badge */}
          {isGlobal && (
            <p className="text-xs text-gray-400">
              This is a global product — only administrators can edit or delete it.
            </p>
          )}
        </div>

        {/* Footer — edit/delete only for own products */}
        {isOwn && (
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
              <Pencil size={14} aria-hidden="true" />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(product)}>
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
