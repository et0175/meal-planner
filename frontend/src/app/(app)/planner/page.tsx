/**
 * Planner page — placeholder for CARD-006 (Meal Planning UI).
 *
 * AC-021: authenticated user navigates to "/" → Meal Planner screen rendered
 * AC-023: Meal Planner → topbar shows at-a-glance week stats (handled by Topbar)
 */

import { CalendarDays } from 'lucide-react'

export default function PlannerPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
        <CalendarDays size={32} className="text-teal-600" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Meal Planner</h2>
      <p className="text-sm text-gray-500 max-w-xs">
        Your weekly meal plan will appear here. Coming in Increment 3.
      </p>
    </div>
  )
}
