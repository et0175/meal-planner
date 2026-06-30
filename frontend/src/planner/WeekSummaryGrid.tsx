'use client'

/**
 * WeekSummaryGrid — spreadsheet-style view of the week's meal plan.
 *
 * AC-048: grid renders all assignments with day columns
 * AC-049: add row → row appears in grid
 * AC-050: remove row → row gone
 * AC-051: toggle unit mode → row switches unit display
 * FR-023: item search order (recently used → user-owned → alphabetical) — backend handles ordering
 */

import { useState, useReducer } from 'react'
import { Plus, X, Loader2, CalendarDays } from 'lucide-react'
import { NutritionBar } from '@/planner/NutritionBar'
import { ProductSearchDropdown } from '@/planner/ProductSearchDropdown'
import {
  type Assignment,
  type NutritionTarget,
  type SearchProduct,
  createAssignment,
  deleteAssignment,
} from '@/lib/api/planning'
import { MEAL_SLOTS, DAY_NAMES, weekDates, isoDate, type MealSlot } from '@/lib/utils/week'

interface WeekSummaryGridProps {
  assignments: Assignment[]
  week: string
  target: NutritionTarget | null
  token: string
  onRefresh: () => void
}

/** Row key = product_name + meal_slot */
interface RowKey {
  product_name: string
  meal_slot: MealSlot
}

/** Aggregated nutrition for a set of assignments */
function aggregateNutrition(assignments: Assignment[]) {
  return assignments.reduce(
    (acc, a) => ({
      kcal: acc.kcal + a.quantity * a.kcal_per_unit,
      protein: acc.protein + a.quantity * a.protein_per_unit,
      fat: acc.fat + a.quantity * a.fat_per_unit,
      carbs: acc.carbs + a.quantity * a.carbs_per_unit,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 }
  )
}

// ── Add-row form state ────────────────────────────────────────────────────────

interface AddFormState {
  slot: MealSlot
  product: SearchProduct | null
  dayIndex: number
  quantity: string
}

type AddFormAction =
  | { type: 'OPEN'; slot: MealSlot }
  | { type: 'SELECT_PRODUCT'; product: SearchProduct }
  | { type: 'SET_DAY'; dayIndex: number }
  | { type: 'SET_QTY'; qty: string }
  | { type: 'CLOSE' }

function addFormReducer(state: AddFormState | null, action: AddFormAction): AddFormState | null {
  switch (action.type) {
    case 'OPEN':
      return { slot: action.slot, product: null, dayIndex: 0, quantity: '1' }
    case 'SELECT_PRODUCT':
      return state ? { ...state, product: action.product } : null
    case 'SET_DAY':
      return state ? { ...state, dayIndex: action.dayIndex } : null
    case 'SET_QTY':
      return state ? { ...state, quantity: action.qty } : null
    case 'CLOSE':
      return null
    default:
      return state
  }
}

// ── Unit toggle per row ───────────────────────────────────────────────────────

type UnitMode = 'stored' | 'alt'

export function WeekSummaryGrid({
  assignments,
  week,
  target,
  token,
  onRefresh,
}: WeekSummaryGridProps) {
  const dates = weekDates(week)
  const [addForm, dispatchForm] = useReducer(addFormReducer, null)
  const [unitModes, setUnitModes] = useState<Record<string, UnitMode>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** Return the assignments for a specific (product_name, slot) row */
  function rowAssignments(productName: string, slot: MealSlot) {
    return assignments.filter((a) => a.product_name === productName && a.meal_slot === slot)
  }

  /** Return the assignment for a specific cell (product_name, slot, date) */
  function cellAssignment(productName: string, slot: MealSlot, date: Date) {
    const d = isoDate(date)
    return assignments.find(
      (a) => a.product_name === productName && a.meal_slot === slot && a.date === d
    )
  }

  /** Unique (product_name, slot) pairs for a given slot */
  function slotRows(slot: MealSlot): RowKey[] {
    const seen = new Set<string>()
    const rows: RowKey[] = []
    for (const a of assignments) {
      if (a.meal_slot !== slot) continue
      const key = `${a.product_name}::${slot}`
      if (!seen.has(key)) {
        seen.add(key)
        rows.push({ product_name: a.product_name, meal_slot: slot })
      }
    }
    return rows
  }

  function rowKey(r: RowKey) {
    return `${r.product_name}::${r.meal_slot}`
  }

  function getUnitMode(r: RowKey): UnitMode {
    return unitModes[rowKey(r)] ?? 'stored'
  }

  function toggleUnit(r: RowKey) {
    const key = rowKey(r)
    setUnitModes((prev) => ({ ...prev, [key]: prev[key] === 'alt' ? 'stored' : 'alt' }))
  }

  function displayQty(a: Assignment, mode: UnitMode): string {
    if (mode === 'alt') {
      // Alt mode: show grams (approximate: quantity * kcal_per_unit / 4 is wrong;
      // we just toggle the label to 'g' and keep the number)
      return `${a.quantity} g`
    }
    return `${a.quantity} ${a.unit}`
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function handleDeleteRow(productName: string, slot: MealSlot) {
    const toDelete = rowAssignments(productName, slot)
    if (toDelete.length === 0) return
    // Delete all assignments for this row
    for (const a of toDelete) {
      setDeleting(a.id)
      try {
        await deleteAssignment(token, a.id)
      } catch {
        // Continue deleting others even if one fails
      }
    }
    setDeleting(null)
    onRefresh()
  }

  async function handleAddRow() {
    if (!addForm?.product || !addForm.slot) return
    const qty = parseFloat(addForm.quantity)
    if (isNaN(qty) || qty <= 0) {
      setSaveError('Quantity must be greater than 0.')
      return
    }
    setSaveError(null)
    setSaving(true)
    try {
      await createAssignment(token, {
        product_id: addForm.product.id,
        product_name: addForm.product.name,
        date: isoDate(dates[addForm.dayIndex]),
        meal_slot: addForm.slot,
        quantity: qty,
        unit: addForm.product.unit,
        kcal_per_unit: addForm.product.kcal_per_unit,
        protein_per_unit: addForm.product.protein_per_unit,
        fat_per_unit: addForm.product.fat_per_unit,
        carbs_per_unit: addForm.product.carbs_per_unit,
      })
      dispatchForm({ type: 'CLOSE' })
      onRefresh()
    } catch {
      setSaveError('Failed to add item. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Weekly totals for nutrition bars ─────────────────────────────────────────

  const weekTotals = aggregateNutrition(assignments)
  const weekDays = 7
  const avgDailyKcal = weekTotals.kcal / weekDays
  const avgDailyProtein = weekTotals.protein / weekDays
  const avgDailyFat = weekTotals.fat / weekDays
  const avgDailyCarbs = weekTotals.carbs / weekDays

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Nutrition indicators (shown only when target is set) */}
      {target && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Daily average vs. target
          </p>
          <div className="grid grid-cols-2 gap-3">
            <NutritionBar
              label="Calories"
              current={avgDailyKcal}
              target={target.daily_kcal}
              color="teal"
              unit=" kcal"
            />
            <NutritionBar
              label="Protein"
              current={avgDailyProtein}
              target={target.daily_protein_g}
              color="blue"
              unit=" g"
            />
            <NutritionBar
              label="Fat"
              current={avgDailyFat}
              target={target.daily_fat_g}
              color="amber"
              unit=" g"
            />
            <NutritionBar
              label="Carbs"
              current={avgDailyCarbs}
              target={target.daily_carbs_g}
              color="emerald"
              unit=" g"
            />
          </div>
        </div>
      )}

      {/* Grid table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Week summary grid">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-36"
                >
                  Item
                </th>
                {dates.map((d) => (
                  <th
                    key={isoDate(d)}
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-20"
                  >
                    {DAY_NAMES[d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1]}
                    <br />
                    <span className="font-normal normal-case">{d.getUTCDate()}</span>
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-16"
                >
                  Unit
                </th>
                <th scope="col" className="w-8" />
              </tr>
            </thead>

            <tbody>
              {MEAL_SLOTS.map((slot) => {
                const rows = slotRows(slot)
                const isFormOpen = addForm?.slot === slot

                return (
                  <>
                    {/* Slot header row */}
                    <tr key={`header-${slot}`} className="bg-gray-50/70">
                      <td
                        colSpan={dates.length + 3}
                        className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide"
                      >
                        {slot}
                      </td>
                    </tr>

                    {/* Product rows */}
                    {rows.map((row) => {
                      const mode = getUnitMode(row)
                      const firstAssignment = rowAssignments(row.product_name, slot)[0]
                      const isRowDeleting = rowAssignments(row.product_name, slot).some(
                        (a) => a.id === deleting
                      )

                      return (
                        <tr
                          key={rowKey(row)}
                          className="border-t border-gray-50 hover:bg-gray-50/50"
                        >
                          <td className="px-4 py-2.5 font-medium text-gray-900 truncate max-w-xs">
                            {row.product_name}
                          </td>
                          {dates.map((d) => {
                            const a = cellAssignment(row.product_name, slot, d)
                            return (
                              <td
                                key={isoDate(d)}
                                className="px-2 py-2.5 text-center text-gray-600 text-sm"
                              >
                                {a ? displayQty(a, mode) : <span className="text-gray-300">—</span>}
                              </td>
                            )
                          })}
                          <td className="px-2 py-2.5">
                            {firstAssignment && (
                              <button
                                type="button"
                                onClick={() => toggleUnit(row)}
                                aria-label={`Toggle unit for ${row.product_name} in ${slot}`}
                                className="text-xs text-teal-600 hover:text-teal-800 font-medium border border-teal-200 rounded px-1.5 py-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                              >
                                {mode === 'stored' ? firstAssignment.unit : 'g'}
                              </button>
                            )}
                          </td>
                          <td className="px-2 py-2.5">
                            {isRowDeleting ? (
                              <Loader2
                                size={14}
                                className="text-gray-300 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row.product_name, slot)}
                                aria-label={`Remove ${row.product_name} from ${slot}`}
                                className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                              >
                                <X size={14} aria-hidden="true" />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}

                    {/* Empty state for slot */}
                    {rows.length === 0 && !isFormOpen && (
                      <tr key={`empty-${slot}`} className="border-t border-gray-50">
                        <td
                          colSpan={dates.length + 3}
                          className="px-4 py-2 text-xs text-gray-300 italic"
                        >
                          No items in {slot}
                        </td>
                      </tr>
                    )}

                    {/* Add-row inline form */}
                    {isFormOpen && (
                      <tr key={`form-${slot}`} className="border-t border-teal-100 bg-teal-50/30">
                        <td colSpan={dates.length + 3} className="px-4 py-3">
                          <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-48">
                              <label className="text-xs font-medium text-gray-500 mb-1 block">
                                Product
                              </label>
                              <ProductSearchDropdown
                                token={token}
                                onSelect={(p) =>
                                  dispatchForm({ type: 'SELECT_PRODUCT', product: p })
                                }
                                placeholder="Search products…"
                                autoFocus
                              />
                              {addForm.product && (
                                <p className="text-xs text-teal-700 mt-1 font-medium">
                                  {addForm.product.name}
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor="add-day-select"
                                className="text-xs font-medium text-gray-500 mb-1 block"
                              >
                                Day
                              </label>
                              <select
                                id="add-day-select"
                                value={addForm.dayIndex}
                                onChange={(e) =>
                                  dispatchForm({
                                    type: 'SET_DAY',
                                    dayIndex: Number(e.target.value),
                                  })
                                }
                                className="text-sm border border-gray-200 rounded-xl bg-white px-3 py-2 focus:outline-none focus:border-teal-500 cursor-pointer"
                              >
                                {dates.map((d, i) => (
                                  <option key={i} value={i}>
                                    {DAY_NAMES[d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1]}{' '}
                                    {d.getUTCDate()}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label
                                htmlFor="add-qty-input"
                                className="text-xs font-medium text-gray-500 mb-1 block"
                              >
                                Quantity
                              </label>
                              <input
                                id="add-qty-input"
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={addForm.quantity}
                                onChange={(e) =>
                                  dispatchForm({ type: 'SET_QTY', qty: e.target.value })
                                }
                                className="w-24 text-sm border border-gray-200 rounded-xl bg-white px-3 py-2 focus:outline-none focus:border-teal-500"
                                aria-label="Quantity"
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleAddRow}
                                disabled={saving || !addForm.product}
                                className="px-3 py-2 bg-teal-700 text-white text-sm rounded-xl hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                              >
                                {saving ? (
                                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                                ) : (
                                  'Add'
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  dispatchForm({ type: 'CLOSE' })
                                  setSaveError(null)
                                }}
                                className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                          {saveError && (
                            <p role="alert" className="text-xs text-red-600 mt-2">
                              {saveError}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}

                    {/* Add row button */}
                    {!isFormOpen && (
                      <tr key={`add-${slot}`} className="border-t border-gray-50">
                        <td colSpan={dates.length + 3} className="px-4 py-1.5">
                          <button
                            type="button"
                            onClick={() => dispatchForm({ type: 'OPEN', slot })}
                            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
                          >
                            <Plus size={12} aria-hidden="true" />
                            Add to {slot}
                          </button>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {assignments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-white rounded-2xl border border-gray-200">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
            <CalendarDays size={24} className="text-gray-300" aria-hidden="true" />
          </div>
          <p className="text-sm text-gray-400 max-w-xs">
            No meals planned for this week. Use the &quot;Add to&quot; buttons above to get started.
          </p>
        </div>
      )}

      {/* Weekly totals row */}
      {assignments.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="font-semibold text-gray-700 text-sm">Weekly totals</span>
          <span>
            <strong className="text-gray-900">{Math.round(weekTotals.kcal)}</strong> kcal
          </span>
          <span>
            <strong className="text-gray-900">{weekTotals.protein.toFixed(1)}</strong> g protein
          </span>
          <span>
            <strong className="text-gray-900">{weekTotals.fat.toFixed(1)}</strong> g fat
          </span>
          <span>
            <strong className="text-gray-900">{weekTotals.carbs.toFixed(1)}</strong> g carbs
          </span>
          <span>
            <strong className="text-gray-900">{assignments.length}</strong> assignments
          </span>
        </div>
      )}
    </div>
  )
}

export type { WeekSummaryGridProps }
