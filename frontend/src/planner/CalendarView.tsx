'use client'

/**
 * CalendarView — week/4-day/single-day calendar with meal slots.
 *
 * AC-053: Calendar tab → items grouped under Breakfast/Lunch/Dinner/Snacks
 * AC-054: add to Tuesday Dinner → item appears
 * AC-055: drag item → moves to new slot/day (HTML5 native DnD)
 * AC-056: adjust servings stepper → quantity updated
 * AC-057: switch to single-day layout → only that day shown
 * AC-115: servings = 0 → validation error shown
 * AC-116: empty day in single layout → empty-state per slot
 * AC-065: log day → confirmation feedback
 * AC-067: log single item → confirmation feedback
 */

import { useState, useReducer } from 'react'
import {
  Plus,
  X,
  Minus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookmarkCheck,
  GripVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { NutritionBar } from '@/planner/NutritionBar'
import { ProductSearchDropdown } from '@/planner/ProductSearchDropdown'
import {
  type Assignment,
  type NutritionTarget,
  type SearchProduct,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  moveAssignment,
  logDay,
  logItem,
} from '@/lib/api/planning'
import { MEAL_SLOTS, weekDates, isoDate, shortDayLabel, type MealSlot } from '@/lib/utils/week'

// ── Layout types ──────────────────────────────────────────────────────────────

export type CalendarLayout = 'week' | '4day' | 'day'

// ── Add-item per-cell inline form ─────────────────────────────────────────────

interface AddCellForm {
  date: string
  slot: MealSlot
  product: SearchProduct | null
  quantity: string
}

type AddCellAction =
  | { type: 'OPEN'; date: string; slot: MealSlot }
  | { type: 'SELECT'; product: SearchProduct }
  | { type: 'SET_QTY'; qty: string }
  | { type: 'CLOSE' }

function addCellReducer(state: AddCellForm | null, action: AddCellAction): AddCellForm | null {
  switch (action.type) {
    case 'OPEN':
      return { date: action.date, slot: action.slot, product: null, quantity: '1' }
    case 'SELECT':
      return state ? { ...state, product: action.product } : null
    case 'SET_QTY':
      return state ? { ...state, quantity: action.qty } : null
    case 'CLOSE':
      return null
    default:
      return state
  }
}

// ── Slot style map ────────────────────────────────────────────────────────────

const SLOT_STYLES: Record<MealSlot, string> = {
  Breakfast: 'bg-amber-50 border-amber-100 text-amber-800',
  Lunch: 'bg-green-50 border-green-100 text-green-800',
  Dinner: 'bg-blue-50 border-blue-100 text-blue-800',
  Snacks: 'bg-purple-50 border-purple-100 text-purple-800',
}

const SLOT_HEADER_STYLES: Record<MealSlot, string> = {
  Breakfast: 'text-amber-700',
  Lunch: 'text-green-700',
  Dinner: 'text-blue-700',
  Snacks: 'text-purple-700',
}

// ── Drag data type ────────────────────────────────────────────────────────────

interface DragData {
  assignmentId: number
  sourceDate: string
  sourceMealSlot: MealSlot
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface CalendarViewProps {
  assignments: Assignment[]
  week: string
  target: NutritionTarget | null
  token: string
  onRefresh: () => void
  onLogFeedback: (msg: string) => void
}

// ── Day column component ──────────────────────────────────────────────────────

interface DayColumnProps {
  date: Date
  assignments: Assignment[]
  target: NutritionTarget | null
  token: string
  addForm: AddCellForm | null
  dispatchAdd: React.Dispatch<AddCellAction>
  onSave: () => void
  onLogDay: (date: string) => void
  dragData: DragData | null
  onDragStart: (data: DragData) => void
  onDrop: (targetDate: string, targetSlot: MealSlot, dropEvent?: any) => void
}

function DayColumn({
  date,
  assignments,
  target,
  token,
  addForm,
  dispatchAdd,
  onSave,
  onLogDay,
  dragData,
  onDragStart,
  onDrop,
}: DayColumnProps) {
  const dateStr = isoDate(date)
  const dayAssignments = assignments.filter((a) => a.date === dateStr)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [qtyError, setQtyError] = useState<string | null>(null)
  const [loggingDay, setLoggingDay] = useState(false)
  const [loggingItemId, setLoggingItemId] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null) // slot being dragged over

  // Totals for nutrition bars
  const totals = dayAssignments.reduce(
    (acc, a) => ({
      kcal: acc.kcal + a.quantity * a.kcal_per_unit,
      protein: acc.protein + a.quantity * a.protein_per_unit,
      fat: acc.fat + a.quantity * a.fat_per_unit,
      carbs: acc.carbs + a.quantity * a.carbs_per_unit,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 }
  )

  async function handleAdd() {
    if (!addForm?.product) return
    const qty = parseFloat(addForm.quantity)
    if (isNaN(qty) || qty <= 0) {
      setQtyError('Quantity must be greater than 0.')
      return
    }
    setQtyError(null)
    setSaving(true)
    try {
      await createAssignment(token, {
        product_id: addForm.product.id,
        product_name: addForm.product.name,
        date: addForm.date,
        meal_slot: addForm.slot,
        quantity: qty,
        unit: addForm.product.unit,
        kcal_per_unit: addForm.product.kcal_per_unit,
        protein_per_unit: addForm.product.protein_per_unit,
        fat_per_unit: addForm.product.fat_per_unit,
        carbs_per_unit: addForm.product.carbs_per_unit,
      })
      dispatchAdd({ type: 'CLOSE' })
      onSave()
    } catch {
      setQtyError('Failed to add item.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStepperChange(a: Assignment, delta: number) {
    const newQty = a.quantity + delta
    if (newQty <= 0) {
      setQtyError(`Quantity must be greater than 0. (AC-115)`)
      return
    }
    setQtyError(null)
    setEditingId(a.id)
    try {
      await updateAssignment(token, a.id, { quantity: newQty })
      onSave()
    } catch {
      // leave quantity unchanged on error
    } finally {
      setEditingId(null)
    }
  }

  async function handleDelete(id: number) {
    setEditingId(id)
    try {
      await deleteAssignment(token, id)
      onSave()
    } catch {
      // ignore
    } finally {
      setEditingId(null)
    }
  }

  async function handleLogDay() {
    setLoggingDay(true)
    try {
      await logDay(token, dateStr)
      onLogDay(dateStr)
    } catch {
      // ignore — log actions are fire-and-forget
    } finally {
      setLoggingDay(false)
    }
  }

  async function handleLogItem(id: number) {
    setLoggingItemId(id)
    try {
      await logItem(token, id)
    } catch {
      // ignore
    } finally {
      setLoggingItemId(null)
    }
  }

  return (
    <div className="flex flex-col min-w-0 border-r border-gray-100 last:border-r-0">
      {/* Day header */}
      <div className="px-2 pt-2 pb-1 border-b border-gray-100 flex items-center justify-between gap-1">
        <span className="text-xs font-semibold text-gray-700">{shortDayLabel(date)}</span>
        <button
          type="button"
          onClick={handleLogDay}
          disabled={loggingDay}
          aria-label={`Log ${shortDayLabel(date)}`}
          title={`Log ${shortDayLabel(date)}`}
          className="p-1 rounded text-gray-300 hover:text-teal-600 hover:bg-teal-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-40"
        >
          {loggingDay ? (
            <Loader2 size={12} className="animate-spin" aria-hidden="true" />
          ) : (
            <BookmarkCheck size={12} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Nutrition bars (when target is set) */}
      {target && (
        <div className="px-2 pt-1 pb-2 space-y-1 border-b border-gray-50">
          <NutritionBar
            label="kcal"
            current={totals.kcal}
            target={target.daily_kcal}
            color="teal"
          />
          <NutritionBar
            label="P"
            current={totals.protein}
            target={target.daily_protein_g}
            color="blue"
            unit="g"
          />
        </div>
      )}

      {/* Slots */}
      <div className="flex-1 space-y-0">
        {MEAL_SLOTS.map((slot) => {
          const slotItems = dayAssignments.filter((a) => a.meal_slot === slot)
          const isAddingHere = addForm?.date === dateStr && addForm.slot === slot
          const isDragOver = dragOver === slot

          return (
            <div
              key={slot}
              onDragOver={(e) => {
                if (dragData) {
                  e.preventDefault()
                  setDragOver(slot)
                }
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(null)
                onDrop(dateStr, slot, e)
              }}
              className={cn(
                'px-2 pt-1.5 pb-1 border-b border-gray-50 min-h-14',
                isDragOver && 'bg-teal-50 ring-1 ring-inset ring-teal-300'
              )}
            >
              <p className={cn('text-xs font-medium mb-1', SLOT_HEADER_STYLES[slot])}>{slot}</p>

              {/* Items */}
              <div className="space-y-1">
                {slotItems.map((a) => (
                  <div
                    key={a.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move'
                      onDragStart({
                        assignmentId: a.id,
                        sourceDate: a.date,
                        sourceMealSlot: a.meal_slot,
                      })
                    }}
                    onDragEnd={() => setDragOver(null)}
                    className={cn(
                      'flex items-center gap-1 px-1.5 py-1 rounded-lg text-xs',
                      'border',
                      SLOT_STYLES[slot],
                      'cursor-grab active:cursor-grabbing'
                    )}
                  >
                    <GripVertical
                      size={10}
                      className="text-current opacity-40 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate font-medium">{a.product_name}</span>

                    {/* Stepper */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStepperChange(a, -1)}
                        disabled={editingId === a.id}
                        aria-label={`Decrease quantity for ${a.product_name}`}
                        className="w-4 h-4 flex items-center justify-center rounded hover:bg-black/10 cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
                      >
                        <Minus size={8} aria-hidden="true" />
                      </button>
                      <span
                        className="w-10 text-center font-semibold"
                        aria-label={`${a.quantity} ${a.unit}`}
                      >
                        {editingId === a.id ? (
                          <Loader2 size={8} className="animate-spin mx-auto" aria-hidden="true" />
                        ) : (
                          `${a.quantity}${a.unit.length <= 2 ? a.unit : ''}`
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStepperChange(a, 1)}
                        disabled={editingId === a.id}
                        aria-label={`Increase quantity for ${a.product_name}`}
                        className="w-4 h-4 flex items-center justify-center rounded hover:bg-black/10 cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
                      >
                        <Plus size={8} aria-hidden="true" />
                      </button>
                    </div>

                    {/* Log item */}
                    <button
                      type="button"
                      onClick={() => handleLogItem(a.id)}
                      disabled={loggingItemId === a.id}
                      aria-label={`Log ${a.product_name}`}
                      className="p-0.5 rounded hover:bg-black/10 cursor-pointer disabled:opacity-40 focus-visible:outline-none"
                    >
                      {loggingItemId === a.id ? (
                        <Loader2 size={9} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <BookmarkCheck size={9} aria-hidden="true" />
                      )}
                    </button>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      disabled={editingId === a.id}
                      aria-label={`Remove ${a.product_name}`}
                      className="p-0.5 rounded hover:bg-black/10 cursor-pointer disabled:opacity-40 focus-visible:outline-none"
                    >
                      <X size={9} aria-hidden="true" />
                    </button>
                  </div>
                ))}

                {/* Empty slot state */}
                {slotItems.length === 0 && !isAddingHere && (
                  <p className="text-xs text-gray-200 italic">empty</p>
                )}

                {/* Inline add form */}
                {isAddingHere && (
                  <div className="space-y-1.5 pt-1">
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
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={addForm.quantity}
                        onChange={(e) => dispatchAdd({ type: 'SET_QTY', qty: e.target.value })}
                        className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-teal-500"
                        aria-label="Quantity"
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
                          setQtyError(null)
                        }}
                        className="px-2 py-1 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                    {qtyError && (
                      <p role="alert" className="text-xs text-red-600">
                        {qtyError}
                      </p>
                    )}
                  </div>
                )}

                {/* Add button */}
                {!isAddingHere && (
                  <button
                    type="button"
                    onClick={() => dispatchAdd({ type: 'OPEN', date: dateStr, slot })}
                    aria-label={`Add item to ${slot} on ${shortDayLabel(date)}`}
                    className="flex items-center gap-0.5 text-xs text-gray-300 hover:text-teal-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
                  >
                    <Plus size={10} aria-hidden="true" />
                    Add
                  </button>
                )}
              </div>

              {qtyError && !isAddingHere && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {qtyError}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main CalendarView ─────────────────────────────────────────────────────────

export function CalendarView({
  assignments,
  week,
  target,
  token,
  onRefresh,
  onLogFeedback,
}: CalendarViewProps) {
  const dates = weekDates(week)
  const [layout, setLayout] = useState<CalendarLayout>('week')
  const [dayIndex, setDayIndex] = useState(0) // for day/4day views
  const [addForm, dispatchAdd] = useReducer(addCellReducer, null)
  const [dragData, setDragData] = useState<DragData | null>(null)

  // Columns to display based on layout
  let visibleDates: Date[]
  if (layout === 'week') {
    visibleDates = dates
  } else if (layout === '4day') {
    visibleDates = dates.slice(dayIndex, dayIndex + 4)
  } else {
    visibleDates = [dates[dayIndex]]
  }

  async function handleDrop(targetDate: string, targetSlot: MealSlot, dropEvent?: any) {
    // Handle product drops from WeekProductsPanel
    if (dropEvent && !dragData) {
      const dataStr = dropEvent.dataTransfer?.getData('application/json')
      if (dataStr) {
        try {
          const dropData = JSON.parse(dataStr)
          if (dropData.type === 'product' && dropData.product) {
            const product = dropData.product
            dispatchAdd({ type: 'OPEN', date: targetDate, slot: targetSlot })
            dispatchAdd({ type: 'SELECT', product: { id: product.id, name: product.name } })
            return
          }
        } catch {
          // ignore invalid JSON
        }
      }
    }
    
    if (!dragData) return
    if (dragData.sourceDate === targetDate && dragData.sourceMealSlot === targetSlot) {
      setDragData(null)
      return
    }
    try {
      await moveAssignment(token, dragData.assignmentId, {
        date: targetDate,
        meal_slot: targetSlot,
      })
      onRefresh()
    } catch {
      // ignore — item stays in original position
    } finally {
      setDragData(null)
    }
  }

  function handleLogDay(dateStr: string) {
    const d = dates.find((d) => isoDate(d) === dateStr)
    const label = d ? shortDayLabel(d) : dateStr
    onLogFeedback(`Logged ${label}`)
  }

  return (
    <div className="space-y-3">
      {/* Layout toggle + day navigation */}
      <div className="flex items-center gap-3">
        {/* Layout selector */}
        <div
          className="flex rounded-xl overflow-hidden border border-gray-200 text-xs"
          role="group"
          aria-label="Calendar layout"
        >
          {(['week', '4day', 'day'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setLayout(l)
                setDayIndex(0)
              }}
              aria-pressed={layout === l}
              className={cn(
                'px-3 py-1.5 font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-teal-500',
                layout === l ? 'bg-teal-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              {l === '4day' ? '4 day' : l === 'day' ? 'Day' : 'Week'}
            </button>
          ))}
        </div>

        {/* Day navigator (for day and 4day layouts) */}
        {layout !== 'week' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDayIndex((i) => Math.max(0, i - 1))}
              disabled={dayIndex === 0}
              aria-label="Previous day"
              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-24 text-center">
              {layout === 'day'
                ? shortDayLabel(dates[dayIndex])
                : `${shortDayLabel(dates[dayIndex])} – ${shortDayLabel(dates[Math.min(dayIndex + 3, 6)])}`}
            </span>
            <button
              type="button"
              onClick={() => setDayIndex((i) => Math.min(i + 1, layout === '4day' ? 3 : 6))}
              disabled={
                (layout === 'day' && dayIndex === 6) || (layout === '4day' && dayIndex >= 3)
              }
              aria-label="Next day"
              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${visibleDates.length}, minmax(0, 1fr))`,
        }}
        aria-label="Meal plan calendar"
      >
        {visibleDates.map((date) => (
          <DayColumn
            key={isoDate(date)}
            date={date}
            assignments={assignments}
            target={target}
            token={token}
            addForm={addForm}
            dispatchAdd={dispatchAdd}
            onSave={onRefresh}
            onLogDay={handleLogDay}
            dragData={dragData}
            onDragStart={setDragData}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  )
}

// ── Export navigation helpers for tests ───────────────────────────────────────
export type { CalendarViewProps }
