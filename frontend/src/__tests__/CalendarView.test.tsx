/**
 * RTL integration tests for CalendarView.
 *
 * AC-053: Calendar tab → items grouped under Breakfast/Lunch/Dinner/Snacks
 * AC-054: add to Tuesday Dinner → item appears (via createAssignment call)
 * AC-055: drag item → moves to new slot/day (via moveAssignment call)
 * AC-056: adjust servings stepper → quantity updated (via updateAssignment call)
 * AC-057: switch to single-day layout → only that day shown
 * AC-115: servings = 0 → validation error shown
 * AC-116: empty day in single layout → empty-state per slot
 */

import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CalendarView } from '@/planner/CalendarView'
import type { Assignment, NutritionTarget } from '@/lib/api/planning'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockCreateAssignment = jest.fn()
const mockUpdateAssignment = jest.fn()
const mockDeleteAssignment = jest.fn()
const mockMoveAssignment = jest.fn()
const mockLogDay = jest.fn()
const mockLogItem = jest.fn()
const mockSearchPlanProducts = jest.fn()

jest.mock('@/lib/api/planning', () => ({
  createAssignment: (...args: unknown[]) => mockCreateAssignment(...args),
  updateAssignment: (...args: unknown[]) => mockUpdateAssignment(...args),
  deleteAssignment: (...args: unknown[]) => mockDeleteAssignment(...args),
  moveAssignment: (...args: unknown[]) => mockMoveAssignment(...args),
  logDay: (...args: unknown[]) => mockLogDay(...args),
  logItem: (...args: unknown[]) => mockLogItem(...args),
  searchPlanProducts: (...args: unknown[]) => mockSearchPlanProducts(...args),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const WEEK = '2026-W26'
const TOKEN = 'tok_test'

// Monday Jun 22, 2026 (W26)
const A_MON_BREAKFAST: Assignment = {
  id: 1,
  product_id: 101,
  product_name: 'Oatmeal',
  date: '2026-06-22',
  meal_slot: 'Breakfast',
  quantity: 1,
  unit: 'serving',
  kcal_per_unit: 300,
  protein_per_unit: 10,
  fat_per_unit: 5,
  carbs_per_unit: 55,
}

// Tuesday Jun 23, 2026 — Dinner
const A_TUE_DINNER: Assignment = {
  id: 2,
  product_id: 102,
  product_name: 'Chicken',
  date: '2026-06-23',
  meal_slot: 'Dinner',
  quantity: 200,
  unit: 'g',
  kcal_per_unit: 2.1,
  protein_per_unit: 0.3,
  fat_per_unit: 0.05,
  carbs_per_unit: 0,
}

const TARGET: NutritionTarget = {
  daily_kcal: 2000,
  daily_protein_g: 150,
  daily_fat_g: 70,
  daily_carbs_g: 250,
}

function renderCalendar(
  assignments: Assignment[] = [],
  onRefresh = jest.fn(),
  target: NutritionTarget | null = null,
  onLogFeedback = jest.fn()
) {
  return render(
    <CalendarView
      assignments={assignments}
      week={WEEK}
      target={target}
      token={TOKEN}
      onRefresh={onRefresh}
      onLogFeedback={onLogFeedback}
    />
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockCreateAssignment.mockReset()
  mockUpdateAssignment.mockReset()
  mockDeleteAssignment.mockReset()
  mockMoveAssignment.mockReset()
  mockLogDay.mockReset()
  mockLogItem.mockReset()
  mockSearchPlanProducts.mockReset()
  mockSearchPlanProducts.mockResolvedValue([])
})

describe('CalendarView', () => {
  it('renders week view with 7 day columns (AC-053)', () => {
    renderCalendar()
    // Week layout: 7 columns with 4 meal slots each
    expect(screen.getAllByText('Breakfast').length).toBe(7)
    expect(screen.getAllByText('Lunch').length).toBe(7)
    expect(screen.getAllByText('Dinner').length).toBe(7)
    expect(screen.getAllByText('Snacks').length).toBe(7)
  })

  it('shows assignment items in correct slots (AC-053)', () => {
    renderCalendar([A_MON_BREAKFAST, A_TUE_DINNER])
    expect(screen.getByText('Oatmeal')).toBeInTheDocument()
    expect(screen.getByText('Chicken')).toBeInTheDocument()
  })

  it('renders nutrition bars when target is set (AC-063)', () => {
    renderCalendar([A_MON_BREAKFAST], jest.fn(), TARGET)
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0)
  })

  it('does not render nutrition bars without target (AC-064)', () => {
    renderCalendar([A_MON_BREAKFAST], jest.fn(), null)
    expect(screen.queryAllByRole('progressbar').length).toBe(0)
  })

  it('switches to single-day layout showing only one day (AC-057)', async () => {
    const user = userEvent.setup()
    renderCalendar([A_MON_BREAKFAST])

    // The layout toggle group has "Week", "4 day", "Day" buttons
    const dayBtn = screen.getByRole('button', { name: 'Day' })
    await user.click(dayBtn)

    // In day layout, only 1 copy of each slot label (single day)
    expect(screen.getAllByText('Breakfast').length).toBe(1)
    expect(screen.getAllByText('Lunch').length).toBe(1)
    expect(screen.getAllByText('Dinner').length).toBe(1)
    expect(screen.getAllByText('Snacks').length).toBe(1)
  })

  it('shows empty slot state in single-day layout (AC-116)', async () => {
    const user = userEvent.setup()
    // Render with no assignments
    renderCalendar([])

    const dayBtn = screen.getByRole('button', { name: 'Day' })
    await user.click(dayBtn)

    // Each slot shows "empty" placeholder
    expect(screen.getAllByText('empty').length).toBe(4)
  })

  it('stepper increase calls updateAssignment with incremented quantity (AC-056)', async () => {
    const user = userEvent.setup()
    const onRefresh = jest.fn()
    mockUpdateAssignment.mockResolvedValue({ ...A_MON_BREAKFAST, quantity: 2 })
    renderCalendar([A_MON_BREAKFAST], onRefresh)

    const increaseBtn = screen.getByRole('button', {
      name: /increase quantity for oatmeal/i,
    })
    await user.click(increaseBtn)

    await waitFor(() =>
      expect(mockUpdateAssignment).toHaveBeenCalledWith(TOKEN, A_MON_BREAKFAST.id, { quantity: 2 })
    )
    await waitFor(() => expect(onRefresh).toHaveBeenCalled())
  })

  it('stepper decrease to 0 shows validation error (AC-115)', async () => {
    const user = userEvent.setup()
    // quantity=1, decrease by 1 → 0 → should show error
    renderCalendar([A_MON_BREAKFAST])

    const decreaseBtn = screen.getByRole('button', {
      name: /decrease quantity for oatmeal/i,
    })
    await user.click(decreaseBtn)

    // The error appears in a role="alert" element inside the slot
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      const hasQtyError = alerts.some((el) =>
        el.textContent?.toLowerCase().includes('quantity must be greater than 0')
      )
      expect(hasQtyError).toBe(true)
    })
    expect(mockUpdateAssignment).not.toHaveBeenCalled()
  })

  it('remove button calls deleteAssignment', async () => {
    const user = userEvent.setup()
    const onRefresh = jest.fn()
    mockDeleteAssignment.mockResolvedValue(undefined)
    renderCalendar([A_MON_BREAKFAST], onRefresh)

    const removeBtn = screen.getByRole('button', { name: /remove oatmeal/i })
    await user.click(removeBtn)

    await waitFor(() =>
      expect(mockDeleteAssignment).toHaveBeenCalledWith(TOKEN, A_MON_BREAKFAST.id)
    )
    await waitFor(() => expect(onRefresh).toHaveBeenCalled())
  })

  it('log day button calls logDay and triggers feedback (AC-065)', async () => {
    const user = userEvent.setup()
    const onLogFeedback = jest.fn()
    mockLogDay.mockResolvedValue(undefined)
    renderCalendar([A_MON_BREAKFAST], jest.fn(), null, onLogFeedback)

    // Each day header has a "Log Mon 22" button — find the first one
    const logDayBtns = screen.getAllByRole('button', { name: /log mon/i })
    await user.click(logDayBtns[0])

    await waitFor(() => expect(mockLogDay).toHaveBeenCalledWith(TOKEN, '2026-06-22'))
    await waitFor(() =>
      expect(onLogFeedback).toHaveBeenCalledWith(expect.stringContaining('Mon'))
    )
  })

  it('log item button calls logItem (AC-067)', async () => {
    const user = userEvent.setup()
    mockLogItem.mockResolvedValue(undefined)
    renderCalendar([A_MON_BREAKFAST])

    const logItemBtn = screen.getByRole('button', { name: /log oatmeal/i })
    await user.click(logItemBtn)

    await waitFor(() => expect(mockLogItem).toHaveBeenCalledWith(TOKEN, A_MON_BREAKFAST.id))
  })

  it('draggable assignment item has draggable=true attribute (AC-055)', () => {
    renderCalendar([A_MON_BREAKFAST])
    const itemContainer = screen.getByText('Oatmeal').closest('[draggable="true"]')
    expect(itemContainer).toBeInTheDocument()
  })

  it('drag and drop calls moveAssignment (AC-055)', async () => {
    mockMoveAssignment.mockResolvedValue({
      ...A_MON_BREAKFAST,
      date: '2026-06-23',
      meal_slot: 'Lunch',
    })
    const onRefresh = jest.fn()
    renderCalendar([A_MON_BREAKFAST], onRefresh)

    // Find the draggable item
    const draggable = screen.getByText('Oatmeal').closest('[draggable="true"]')!

    // Simulate dragstart — sets internal dragData
    fireEvent.dragStart(draggable, {
      dataTransfer: { effectAllowed: 'move' },
    })

    // Find a Lunch area in the second column (Tuesday)
    const allLunchHeadings = screen.getAllByText('Lunch')
    // The second Lunch is Tuesday (index 1)
    const tueLunchParent = allLunchHeadings[1].closest('div')!

    fireEvent.dragOver(tueLunchParent, { dataTransfer: {} })
    fireEvent.drop(tueLunchParent, { dataTransfer: {} })

    await waitFor(() => expect(mockMoveAssignment).toHaveBeenCalled())
    await waitFor(() => expect(onRefresh).toHaveBeenCalled())
  })

  it('switches to 4-day layout (AC-057)', async () => {
    const user = userEvent.setup()
    renderCalendar([])

    const fourDayBtn = screen.getByRole('button', { name: '4 day' })
    await user.click(fourDayBtn)

    // In 4-day layout: only 4 copies of each slot label
    expect(screen.getAllByText('Breakfast').length).toBe(4)
    expect(screen.getAllByText('Lunch').length).toBe(4)
  })

  it('add button opens inline form for product search (AC-054)', async () => {
    const user = userEvent.setup()
    renderCalendar([])

    const addBtns = screen.getAllByRole('button', { name: /add item to dinner/i })
    await user.click(addBtns[0])

    expect(
      screen.getByRole('combobox', { name: /search for a product/i })
    ).toBeInTheDocument()
  })

  it('add flow creates assignment and refreshes (AC-054)', async () => {
    const user = userEvent.setup()
    const onRefresh = jest.fn()
    const product = {
      id: 200,
      name: 'Salmon',
      category: 'Fish',
      kcal_per_unit: 2.0,
      protein_per_unit: 0.25,
      fat_per_unit: 0.12,
      carbs_per_unit: 0,
      unit: 'g',
    }
    mockSearchPlanProducts.mockResolvedValue([product])
    mockCreateAssignment.mockResolvedValue({ id: 201, ...product })
    renderCalendar([], onRefresh)

    // Open add for Monday Dinner
    const addBtns = screen.getAllByRole('button', { name: /add item to dinner/i })
    await user.click(addBtns[0])

    // Use the specific search combobox
    const searchBox = screen.getByRole('combobox', { name: /search for a product/i })
    await user.type(searchBox, 'sal')
    await waitFor(() => expect(mockSearchPlanProducts).toHaveBeenCalled())

    await screen.findByRole('listbox', { name: /product search results/i })
    await user.click(screen.getByText('Salmon'))

    // Click Add
    await user.click(screen.getByRole('button', { name: /^add$/i }))

    await waitFor(() =>
      expect(mockCreateAssignment).toHaveBeenCalledWith(
        TOKEN,
        expect.objectContaining({ product_name: 'Salmon', meal_slot: 'Dinner' })
      )
    )
    await waitFor(() => expect(onRefresh).toHaveBeenCalled())
  })
})
