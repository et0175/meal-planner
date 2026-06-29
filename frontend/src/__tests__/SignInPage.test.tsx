import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignInPage from '@/app/(auth)/sign-in/page'
import type { SignInResponse } from '@/lib/api/identity'

// ── mocks ────────────────────────────────────────────────────────────────────

const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}))

const mockSignIn = jest.fn<Promise<SignInResponse>, [{ email: string; password: string }]>()
const mockIsApiError = jest.fn<boolean, [unknown]>()

jest.mock('@/lib/api/identity', () => ({
  signIn: (data: { email: string; password: string }) => mockSignIn(data),
  isApiError: (err: unknown) => mockIsApiError(err),
}))

// ── helpers ──────────────────────────────────────────────────────────────────

const SESSION_KEY = 'mf_session'

function buildApiError(status: number, detail: string, retryAfter?: number) {
  return { status, detail, retryAfter }
}

/**
 * Anchored-regex selectors for form fields.
 *
 * @testing-library/dom v10 getLabelContent recurses into all children (including
 * aria-hidden spans), so the required asterisk is included in the label text:
 * "Email *" / "Password *". Exact string 'Email' fails against "Email *".
 *
 * Using /^email/i and /^password/i:
 * - Matches "Email *" / "Password *" (starts with the field name).
 * - Does NOT match the show-password button's aria-label "Show password"
 *   because that string starts with "Show", not "password".
 */
const getEmailInput = () => screen.getByLabelText(/^email/i)
const getPasswordInput = () => screen.getByLabelText(/^password/i)
const getSubmitBtn = () => screen.getByRole('button', { name: /^sign in$/i })

beforeEach(() => {
  sessionStorage.clear()
  mockPush.mockReset()
  mockReplace.mockReset()
  mockSignIn.mockReset()
  mockIsApiError.mockReset()
  // default: errors are NOT ApiErrors unless the test overrides
  mockIsApiError.mockReturnValue(false)
})

// ── tests ────────────────────────────────────────────────────────────────────

describe('SignInPage', () => {
  it('shows validation errors when submitting with empty fields', async () => {
    const user = userEvent.setup()
    render(<SignInPage />)

    await user.click(getSubmitBtn())

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('calls signIn with trimmed email and password on valid submit', async () => {
    mockSignIn.mockResolvedValue({ token: 'tok_ok', account_id: 7, role: 'user' })
    const user = userEvent.setup()
    render(<SignInPage />)

    await user.type(getEmailInput(), 'chef@example.com')
    await user.type(getPasswordInput(), 'secret123')
    await user.click(getSubmitBtn())

    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'chef@example.com',
        password: 'secret123',
      })
    )
  })

  it('saves session to sessionStorage and redirects to /planner on success', async () => {
    mockSignIn.mockResolvedValue({ token: 'tok_ok', account_id: 7, role: 'user' })
    const user = userEvent.setup()
    render(<SignInPage />)

    await user.type(getEmailInput(), 'chef@example.com')
    await user.type(getPasswordInput(), 'secret123')
    await user.click(getSubmitBtn())

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/planner'))

    const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null')
    expect(stored).toMatchObject({ token: 'tok_ok', accountId: 7, email: 'chef@example.com' })
  })

  it('shows "Invalid email or password." on 401', async () => {
    const err = buildApiError(401, 'Unauthorized')
    mockSignIn.mockRejectedValue(err)
    mockIsApiError.mockImplementation((e) => e === err)

    const user = userEvent.setup()
    render(<SignInPage />)

    await user.type(getEmailInput(), 'chef@example.com')
    await user.type(getPasswordInput(), 'wrongpassword')
    await user.click(getSubmitBtn())

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.')
    })
  })

  it('shows rate-limit message mentioning 60 minutes on 429 with Retry-After 3600', async () => {
    const err = buildApiError(429, 'Too many requests', 3600)
    mockSignIn.mockRejectedValue(err)
    mockIsApiError.mockImplementation((e) => e === err)

    const user = userEvent.setup()
    render(<SignInPage />)

    await user.type(getEmailInput(), 'chef@example.com')
    await user.type(getPasswordInput(), 'somepassword')
    await user.click(getSubmitBtn())

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/60 minute/i)
    })
  })

  it('show/hide password toggle switches input type between password and text', async () => {
    const user = userEvent.setup()
    render(<SignInPage />)

    const passwordInput = getPasswordInput()
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
