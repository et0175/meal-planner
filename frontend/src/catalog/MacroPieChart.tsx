'use client'

/**
 * MacroPieChart — SVG donut chart showing macronutrient distribution.
 *
 * Renders protein, fat, and carbs as coloured arcs proportional to their
 * caloric contribution (protein/carbs 4 kcal/g, fat 9 kcal/g).
 * Shows the total calories in the centre hole.
 *
 * No external charting library — pure SVG stroke-dasharray technique.
 */

import type { Nutrition } from '@/lib/api/catalog'

interface MacroPieChartProps {
  nutrition: Nutrition
}

const COLORS = {
  protein: '#2d9b9f', // teal-500
  fat: '#f59e0b', // amber-400
  carbs: '#10b981', // emerald-500
}

const CX = 60
const CY = 60
const R = 42
const THICKNESS = 18
const CIRCUMFERENCE = 2 * Math.PI * R

interface SliceInfo {
  label: string
  grams: number
  kcal: number
  color: string
}

export function MacroPieChart({ nutrition }: MacroPieChartProps) {
  const proteinKcal = nutrition.protein_g * 4
  const fatKcal = nutrition.fat_g * 9
  const carbsKcal = nutrition.carbs_g * 4
  const macroKcal = proteinKcal + fatKcal + carbsKcal

  const slices: SliceInfo[] = [
    { label: 'Protein', grams: nutrition.protein_g, kcal: proteinKcal, color: COLORS.protein },
    { label: 'Fat', grams: nutrition.fat_g, kcal: fatKcal, color: COLORS.fat },
    { label: 'Carbs', grams: nutrition.carbs_g, kcal: carbsKcal, color: COLORS.carbs },
  ]

  if (macroKcal === 0) {
    return (
      <div className="flex items-center gap-6">
        <div
          className="w-24 h-24 rounded-full border-8 border-gray-100 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-gray-300 text-xs">–</span>
        </div>
        <p className="text-sm text-gray-400">No macro data available.</p>
      </div>
    )
  }

  let cumulative = 0
  const arcs = slices.map((slice) => {
    const fraction = slice.kcal / macroKcal
    const dashLen = fraction * CIRCUMFERENCE
    const rotation = cumulative * 360 - 90
    cumulative += fraction
    return { ...slice, fraction, dashLen, rotation }
  })

  return (
    <div className="flex items-start gap-5">
      <svg
        width="120"
        height="120"
        role="img"
        aria-label={`Macro distribution: protein ${nutrition.protein_g}g, fat ${nutrition.fat_g}g, carbs ${nutrition.carbs_g}g`}
      >
        {arcs.map((arc, i) => {
          if (arc.fraction < 0.001) return null
          return (
            <circle
              key={i}
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth={THICKNESS}
              strokeDasharray={`${arc.dashLen.toFixed(2)} ${(CIRCUMFERENCE - arc.dashLen).toFixed(2)}`}
              transform={`rotate(${arc.rotation.toFixed(2)}, ${CX}, ${CY})`}
            />
          )
        })}
        {/* White donut hole */}
        <circle cx={CX} cy={CY} r={R - THICKNESS / 2 - 1} fill="white" />
        {/* Centre label */}
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="13" fill="#111827" fontWeight="700">
          {Math.round(nutrition.calories)}
        </text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize="8" fill="#6b7280">
          kcal
        </text>
      </svg>

      <div className="space-y-2.5 pt-2">
        {arcs.map((arc) => (
          <div key={arc.label} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: arc.color }}
              aria-hidden="true"
            />
            <span className="text-gray-500 w-12 text-xs">{arc.label}</span>
            <span className="font-semibold text-gray-900">{arc.grams} g</span>
            {macroKcal > 0 && (
              <span className="text-xs text-gray-400">
                ({Math.round((arc.kcal / macroKcal) * 100)}%)
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
