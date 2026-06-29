import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth, type Session } from '@/lib/hooks/useAuth'

const SESSION_KEY = 'mf_session'

const SAMPLE_SESSION: Session = {
  token: 'tok_abc123',
  accountId: 42,
  email: 'user@example.com',
  role: 'user',
}

beforeEach(() => {
  sessionStorage.clear()
})

describe('useAuth', () => {
  /**
   * Note: renderHook wraps render in act() which flushes all effects synchronously.
   * This means by the time result.current is accessible, the useEffect that reads
   * sessionStorage has already run and isLoading has settled to false.
   * We test the settled state, not the transient isLoading:true intermediate.
   */
  it('settles to isLoading false with null session when sessionStorage is empty', async () => {
    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.session).toBeNull()
  })

  it('reads existing session from sessionStorage after mount', async () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(SAMPLE_SESSION))
    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.session).toEqual(SAMPLE_SESSION)
  })

  it('resolves to null session when sessionStorage is empty', async () => {
    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.session).toBeNull()
  })

  it('saveSession writes JSON to sessionStorage and updates state', async () => {
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.saveSession(SAMPLE_SESSION)
    })

    expect(result.current.session).toEqual(SAMPLE_SESSION)
    expect(JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null')).toEqual(SAMPLE_SESSION)
  })

  it('removeSession clears sessionStorage and sets session to null', async () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(SAMPLE_SESSION))
    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.session).toEqual(SAMPLE_SESSION)

    act(() => {
      result.current.removeSession()
    })

    expect(result.current.session).toBeNull()
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })
})
