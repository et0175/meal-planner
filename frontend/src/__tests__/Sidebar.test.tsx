import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from '@/shell/Sidebar'
import type { Session } from '@/lib/hooks/useAuth'

// ── mocks ────────────────────────────────────────────────────────────────────

const mockPush = jest.fn()
const mockPathname = jest.fn<string, []>()

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockPush }),
}))

const mockSignOut = jest.fn()
jest.mock('@/lib/api/identity', () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

// ── helpers ──────────────────────────────────────────────────────────────────

const SESSION_KEY = 'mf_session'

const SAMPLE_SESSION: Session = {
  token: 'tok_test_001',
  accountId: 1,
  email: 'chef@example.com',
  role: 'user',
}

function seedSession(session: Session = SAMPLE_SESSION) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

beforeEach(() => {
  sessionStorage.clear()
  mockPush.mockReset()
  mockSignOut.mockReset()
  mockPathname.mockReturnValue('/planner')
})

// ── tests ────────────────────────────────────────────────────────────────────

describe('Sidebar', () => {
  it('renders all three nav links', () => {
    seedSession()
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: /planner/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /shopping list/i })).toBeInTheDocument()
  })

  it('marks the Planner link active when pathname is /planner', async () => {
    mockPathname.mockReturnValue('/planner')
    seedSession()
    render(<Sidebar />)

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /planner/i })).toHaveAttribute('aria-current', 'page')
    })
    expect(screen.getByRole('link', { name: /products/i })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: /shopping list/i })).not.toHaveAttribute('aria-current')
  })

  it('marks the Products link active when pathname is /products', async () => {
    mockPathname.mockReturnValue('/products')
    seedSession()
    render(<Sidebar />)

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /products/i })).toHaveAttribute(
        'aria-current',
        'page'
      )
    })
    expect(screen.getByRole('link', { name: /planner/i })).not.toHaveAttribute('aria-current')
  })

  it('shows the user email from session', async () => {
    seedSession()
    render(<Sidebar />)

    await waitFor(() => {
      expect(screen.getByText('chef@example.com')).toBeInTheDocument()
    })
  })

  it('sign-out: calls signOut with token, clears session, navigates to /sign-in', async () => {
    mockSignOut.mockResolvedValue(undefined)
    seedSession()
    const user = userEvent.setup()
    render(<Sidebar />)

    const signOutBtn = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutBtn)

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/sign-in'))

    expect(mockSignOut).toHaveBeenCalledWith(SAMPLE_SESSION.token)
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('sign-out clears session even when signOut API call throws', async () => {
    mockSignOut.mockRejectedValue(new Error('Network error'))
    seedSession()
    const user = userEvent.setup()
    render(<Sidebar />)

    const signOutBtn = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutBtn)

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/sign-in'))
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })
})
