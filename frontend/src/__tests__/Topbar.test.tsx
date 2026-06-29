import { render, screen, waitFor } from '@testing-library/react'
import { Topbar } from '@/shell/Topbar'
import type { PlanSummary } from '@/lib/api/planning'

// ── mocks ────────────────────────────────────────────────────────────────────

const mockPathname = jest.fn<string, []>()

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

const mockGetPlanSummary = jest.fn<Promise<PlanSummary>, [string, string, AbortSignal?]>()
jest.mock('@/lib/api/planning', () => ({
  getPlanSummary: (...args: [string, string, AbortSignal?]) => mockGetPlanSummary(...args),
}))

// Only mock getStoredToken; Topbar never calls useAuth hook directly.
jest.mock('@/lib/hooks/useAuth', () => ({
  getStoredToken: () => 'tok_test_topbar',
}))

// ── helpers ──────────────────────────────────────────────────────────────────

const ZERO_SUMMARY: PlanSummary = { total_assignments: 0, total_kcal: 0, week: '' }

beforeEach(() => {
  mockPathname.mockReturnValue('/planner')
  mockGetPlanSummary.mockResolvedValue(ZERO_SUMMARY)
})

// ── tests ────────────────────────────────────────────────────────────────────

describe('Topbar', () => {
  it('shows "Products" heading and no week-summary on /products', () => {
    mockPathname.mockReturnValue('/products')
    render(<Topbar />)

    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /week summary/i })).not.toBeInTheDocument()
  })

  it('shows "Shopping list" heading and no week-summary on /shopping', () => {
    mockPathname.mockReturnValue('/shopping')
    render(<Topbar />)

    expect(screen.getByRole('heading', { name: 'Shopping list' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /week summary/i })).not.toBeInTheDocument()
  })

  it('shows "Planner" heading and week-summary group on /planner', async () => {
    mockPathname.mockReturnValue('/planner')
    render(<Topbar />)

    expect(screen.getByRole('heading', { name: 'Planner' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('group', { name: /week summary/i })).toBeInTheDocument()
    })
  })

  it('shows "3 planned" and "1800 kcal" when getPlanSummary returns real data', async () => {
    mockGetPlanSummary.mockResolvedValue({
      total_assignments: 3,
      total_kcal: 1800,
      week: '2026-W26',
    })
    mockPathname.mockReturnValue('/planner')
    render(<Topbar />)

    await waitFor(() => {
      const summary = screen.getByRole('group', { name: /week summary/i })
      expect(summary).toHaveTextContent('3')
      expect(summary).toHaveTextContent('planned')
      expect(summary).toHaveTextContent('1800')
      expect(summary).toHaveTextContent('kcal')
    })
  })

  it('shows "0 planned" and "0 kcal" on zero state without rendering an error', async () => {
    mockGetPlanSummary.mockResolvedValue(ZERO_SUMMARY)
    mockPathname.mockReturnValue('/planner')
    render(<Topbar />)

    await waitFor(() => {
      expect(screen.getByRole('group', { name: /week summary/i })).toBeInTheDocument()
    })

    const summary = screen.getByRole('group', { name: /week summary/i })
    expect(summary).toHaveTextContent('0')
    expect(summary).toHaveTextContent('planned')
    expect(summary).toHaveTextContent('kcal')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
