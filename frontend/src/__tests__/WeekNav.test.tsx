/**
 * RTL integration tests for WeekNav.
 *
 * AC-046: "Next week" → following week loaded
 * AC-047: "Today" → returns to current week
 * AC-113: on current week → "Today" button highlighted
 * AC-060: diet label shown in header when set
 * AC-061: no diet → no label
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeekNav } from '@/planner/WeekNav'

// ── helpers ───────────────────────────────────────────────────────────────────

function renderWeekNav(overrides: Partial<React.ComponentProps<typeof WeekNav>> = {}) {
  const defaults = {
    week: '2026-W26',
    isCurrentWeek: false,
    onPrev: jest.fn(),
    onNext: jest.fn(),
    onToday: jest.fn(),
    dietLabel: null,
    ...overrides,
  }
  return { ...render(<WeekNav {...defaults} />), ...defaults }
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('WeekNav', () => {
  it('renders week label for a known week', () => {
    renderWeekNav({ week: '2026-W26' })
    // Week 26 of 2026 starts Mon Jun 22
    expect(screen.getByText(/Week 26/)).toBeInTheDocument()
  })

  it('calls onPrev when left arrow clicked (AC-046)', async () => {
    const onPrev = jest.fn()
    renderWeekNav({ onPrev })
    await userEvent.click(screen.getByRole('button', { name: /previous week/i }))
    expect(onPrev).toHaveBeenCalledTimes(1)
  })

  it('calls onNext when right arrow clicked (AC-046)', async () => {
    const onNext = jest.fn()
    renderWeekNav({ onNext })
    await userEvent.click(screen.getByRole('button', { name: /next week/i }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('calls onToday when Today clicked (AC-047)', async () => {
    const onToday = jest.fn()
    renderWeekNav({ onToday })
    await userEvent.click(screen.getByRole('button', { name: /today/i }))
    expect(onToday).toHaveBeenCalledTimes(1)
  })

  it('Today button is highlighted when isCurrentWeek=true (AC-113)', () => {
    renderWeekNav({ isCurrentWeek: true })
    const todayBtn = screen.getByRole('button', { name: /today/i })
    expect(todayBtn).toHaveAttribute('aria-current', 'date')
    expect(todayBtn.className).toMatch(/bg-teal-700/)
  })

  it('Today button is not highlighted when isCurrentWeek=false (AC-113)', () => {
    renderWeekNav({ isCurrentWeek: false })
    const todayBtn = screen.getByRole('button', { name: /today/i })
    expect(todayBtn).not.toHaveAttribute('aria-current')
    expect(todayBtn.className).not.toMatch(/bg-teal-700/)
  })

  it('shows diet label when provided (AC-060)', () => {
    renderWeekNav({ dietLabel: 'Keto' })
    expect(screen.getByText('Keto')).toBeInTheDocument()
  })

  it('does not render diet label when null (AC-061)', () => {
    renderWeekNav({ dietLabel: null })
    expect(screen.queryByText('Keto')).not.toBeInTheDocument()
  })
})
