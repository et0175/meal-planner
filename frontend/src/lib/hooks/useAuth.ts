'use client'

/**
 * useAuth — session management hook.
 *
 * Stores the session token in sessionStorage (tab-scoped, per FR-002).
 * Storage key: 'mf_session'
 */

import { useCallback, useEffect, useReducer } from 'react'

export type Role = 'user' | 'nutritionist'

export interface Session {
  token: string
  accountId: number
  email: string
  role: Role
}

const SESSION_KEY = 'mf_session'

function readSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

function writeSession(session: Session): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function clearSession(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(SESSION_KEY)
}

// ── reducer ──────────────────────────────────────────────────────────────────

interface AuthState {
  session: Session | null
  isLoading: boolean
}

type AuthAction =
  | { type: 'LOADED'; session: Session | null }
  | { type: 'SAVE'; session: Session }
  | { type: 'CLEAR' }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOADED':
      return { session: action.session, isLoading: false }
    case 'SAVE':
      return { session: action.session, isLoading: false }
    case 'CLEAR':
      return { session: null, isLoading: false }
    default:
      return state
  }
}

// ── hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [{ session, isLoading }, dispatch] = useReducer(authReducer, {
    session: null,
    isLoading: true,
  })

  // Read sessionStorage after mount (browser-only).
  // Using useEffect to avoid SSR mismatch.
  useEffect(() => {
    dispatch({ type: 'LOADED', session: readSession() })
  }, [])

  const saveSession = useCallback((s: Session) => {
    writeSession(s)
    dispatch({ type: 'SAVE', session: s })
  }, [])

  const removeSession = useCallback(() => {
    clearSession()
    dispatch({ type: 'CLEAR' })
  }, [])

  return { session, isLoading, saveSession, removeSession }
}

/** Read the session token without a React hook (for use in API calls). */
export function getStoredToken(): string | null {
  const session = readSession()
  return session?.token ?? null
}
