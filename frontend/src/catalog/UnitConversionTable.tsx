/**
 * UnitConversionTable — shows the base 100 g row plus all alternative units.
 *
 * AC-032: modal shows unit conversion table
 * AC-111: single-unit product → one-row table (just the 100 g base row)
 */

import type { ProductUnit } from '@/lib/api/catalog'

interface UnitConversionTableProps {
  units: ProductUnit[]
}

export function UnitConversionTable({ units }: UnitConversionTableProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1.5">Unit conversions</p>
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th scope="col" className="text-left px-3 py-2 text-xs font-medium text-gray-500">
                Unit
              </th>
              <th scope="col" className="text-right px-3 py-2 text-xs font-medium text-gray-500">
                Grams
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* Base unit row — always present */}
            <tr>
              <td className="px-3 py-2 text-gray-600">100 g</td>
              <td className="px-3 py-2 text-right font-semibold text-gray-900">100</td>
            </tr>
            {units.map((unit) => (
              <tr key={unit.id}>
                <td className="px-3 py-2 text-gray-600">1 {unit.unit_name}</td>
                <td className="px-3 py-2 text-right font-semibold text-gray-900">
                  {unit.grams_per_unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
