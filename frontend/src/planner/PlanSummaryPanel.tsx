'use client'

/**
 * PlanSummaryPanel — lists all planned items for the week, grouped by meal slot.
 * Appears above the Calendar grid.
 *
 * AC-058: Calendar tab → summary panel visible with items by slot
 * AC-059: "Add item" in panel → item appears in that slot
 * AC-117: no assignments → empty slot sections (no error)
 */

import { useState, useReducer } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ProductSearchDropdown } from '@/planner/ProductSearchDropdown'
import { type Assignment, type SearchProduct, createAssignment } from '@/lib/api/planning'
import { MEAL_SLOTS, displayMealSlot, weekDates, isoDate, type MealSlot } from '@/lib/utils/week'

interface PlanSummaryPanelProps {
  assignments: Assignment[]
  week: string
  token: string
  onRefresh: () => void
}

// ── Add-item per-slot form state ──────────────────────────────────────────────

interface SlotAddForm {
  slot: MealSlot
  product: SearchProduct | null
  dayIndex: number
  quantity: string
}

type SlotAddAction =
  | { type: 'OPEN'; slot: MealSlot }
  | { type: 'SELECT'; product: SearchProduct }
  | { type: 'SET_DAY'; dayIndex: number }
  | { type: 'SET_QTY'; qty: string }
  | { type: 'CLOSE' }

function slotAddReducer(state: SlotAddForm | null, action: SlotAddAction): SlotAddForm | null {
  switch (action.type) {
    case 'OPEN':
      return { slot: action.slot, product: null, dayIndex: 0, quantity: '1' }
    case 'SELECT':
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

// ── Slot colours ──────────────────────────────────────────────────────────────

const SLOT_DOT: Record<MealSlot, string> = {
  breakfast: 'bg-amber-400',
  lunch: 'bg-green-500',
  dinner: 'bg-blue-500',
  snacks: 'bg-purple-400',
}

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Component ─────────────────────────────────────────────────────────────────

export function PlanSummaryPanel({ assignments, week, token, onRefresh }: PlanSummaryPanelProps) {
  const dates = weekDates(week)
  const [addForm, dispatchAdd] = useReducer(slotAddReducer, null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function slotItems(slot: MealSlot): Assignment[] {
    return assignments.filter((a) => a.meal_slot === slot)
  }

  function dayAbbr(dateStr: string): string {
    const d = dates.find((d) => isoDate(d) === dateStr)
    if (!d) return dateStr
    return DAY_ABBR[d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1]
  }

  async function handleAdd() {
    if (!addForm?.product) return
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
        nutrition: {
          kcal: addForm.product.kcal_per_unit,
          protein_g: addForm.product.protein_per_unit,
          fat_g: addForm.product.fat_per_unit,
          carbs_g: addForm.product.carbs_per_unit,
        },
      })
      dispatchAdd({ type: 'CLOSE' })
      onRefresh()
    } catch {
      setSaveError('Failed to add item. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
      <h2 className="text-sm font-semibold text-gray-900">Week plan at a glance</h2>

      <div className="grid grid-cols-2 gap-4">
        {MEAL_SLOTS.map((slot) => {
          const items = slotItems(slot)
          const isFormOpen = addForm?.slot === slot

          return (
            <div key={slot} className="space-y-2">
              {/* Slot header */}
              <div className="flex items-center gap-1.5">
                <span
                  className={cn('w-2 h-2 rounded-full flex-shrink-0', SLOT_DOT[slot])}
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold text-gray-700">{displayMealSlot(slot)}</span>
                <span className="text-xs text-gray-400 ml-auto">{items.length}</span>
              </div>

              {/* Items */}
              {items.length === 0 && !isFormOpen ? (
                <p className="text-xs text-gray-300 italic">No {slot} planned</p>
              ) : (
                <ul className="space-y-1" aria-label={`${slot} items`}>
                  {items.map((a) => (
                    <li key={a.id} className="flex items-center gap-1 text-xs text-gray-700">
                      <span className="text-gray-400 w-7 flex-shrink-0 text-right">
                        {dayAbbr(a.date)}
                      </span>
                      <span className="flex-1 truncate">{a.product_name}</span>
                      <span className="text-gray-400 flex-shrink-0">
                        {a.quantity} {a.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add-item inline form */}
              {isFormOpen && (
                <div className="space-y-1.5 border border-teal-100 rounded-xl p-2 bg-teal-50/30">
                  <ProductSearchDropdown
                    token={token}
                    onSelect={(p) => dispatchAdd({ type: 'SELECT', product: p })}
                    placeholder="Search…"
                    autoFocus
                  />
                  {addForm.product && (
                    <p className="text-xs font-medium text-teal-700 truncate">
                      {addForm.product.name}
                    </p>
                  )}
                  <div className="flex items-center gap-1">
                    <select
                      value={addForm.dayIndex}
                      onChange={(e) =>
                        dispatchAdd({ type: 'SET_DAY', dayIndex: Number(e.target.value) })
                      }
                      aria-label="Day"
                      className="text-xs border border-gray-200 rounded-lg bg-white px-2 py-1 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      {dates.map((d, i) => (
                        <option key={i} value={i}>
                          {DAY_ABBR[d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1]}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={addForm.quantity}
                      onChange={(e) => dispatchAdd({ type: 'SET_QTY', qty: e.target.value })}
                      aria-label="Quantity"
                      className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={saving || !addForm.product}
                      className="px-2 py-1 bg-teal-700 text-white text-xs rounded-lg hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                    >
                      {saving ? (
                        <Loader2 size={10} className="animate-spin" aria-hidden="true" />
                      ) : (
                        'Add'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        dispatchAdd({ type: 'CLOSE' })
                        setSaveError(null)
                      }}
                      className="px-2 py-1 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                    >
                      ✕
                    </button>
                  </div>
                  {saveError && (
                    <p role="alert" className="text-xs text-red-600">
                      {saveError}
                    </p>
                  )}
                </div>
              )}

              {/* Add item button */}
              {!isFormOpen && (
                <button
                  type="button"
                  onClick={() => dispatchAdd({ type: 'OPEN', slot })}
                  aria-label={`Add item to ${slot}`}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
                >
                  <Plus size={11} aria-hidden="true" />
                  Add item
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
