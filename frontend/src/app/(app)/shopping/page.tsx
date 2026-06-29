/**
 * Shopping list page — placeholder for CARD-008 (Shopping List UI).
 */

import { ShoppingBasket } from 'lucide-react'

export default function ShoppingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
        <ShoppingBasket size={32} className="text-blue-600" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Shopping List</h2>
      <p className="text-sm text-gray-500 max-w-xs">
        Generate your grocery list from your meal plan. Coming in Increment 4.
      </p>
    </div>
  )
}
