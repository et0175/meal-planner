'use client'

/**
 * WeekProductsPanel — displays products flagged as "this_week" and "next_week"
 * for easy drag-and-drop into meal plan sections.
 */

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { getProducts, type Product } from '@/lib/api/catalog'

interface WeekProductsPanelProps {
  token: string
  accountId: number | null
}

export function WeekProductsPanel({ token, accountId }: WeekProductsPanelProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!accountId) return

    setIsLoading(true)
    getProducts(token, {
      week_flag: 'this_week',
      user_id: accountId,
    })
      .then((prods) => {
        setProducts(prods)
      })
      .catch(() => {
        setProducts([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [token, accountId])

  if (isLoading) {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-center gap-2">
        <Loader2 size={16} className="animate-spin text-teal-600" />
        <span className="text-sm text-teal-600">Loading this week's products...</span>
      </div>
    )
  }

  if (!products.length) {
    return null
  }

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
      <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-3">
        This Week's Products
      </p>
      <div className="flex flex-wrap gap-2">
        {products.map((product) => (
          <div
            key={product.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'copy'
              e.dataTransfer.setData(
                'application/json',
                JSON.stringify({
                  type: 'product',
                  product,
                })
              )
            }}
            className="bg-white border border-teal-200 rounded-lg px-3 py-1.5 text-sm cursor-move hover:shadow-md hover:border-teal-300 transition-all select-none"
          >
            <div className="font-medium text-gray-800">{product.name}</div>
            <div className="text-xs text-gray-500">
              {Math.round(product.nutrition.calories)} kcal per {product.units[0]?.unit_name || '100g'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
