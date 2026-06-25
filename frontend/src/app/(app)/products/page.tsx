/**
 * Products page — placeholder for CARD-004 (Product Catalog UI).
 */

import { Apple } from 'lucide-react'

export default function ProductsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
        <Apple size={32} className="text-green-600" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Products</h2>
      <p className="text-sm text-gray-500 max-w-xs">
        Browse and manage your product catalog. Coming in Increment 2.
      </p>
    </div>
  )
}
