'use client'

/**
 * App shell layout — authenticated pages.
 *
 * Auth guard: reads session from sessionStorage.
 * If missing → redirect to /sign-in (AC-018).
 * Validates session against identity service to catch expired tokens (AC-019).
 *
 * Renders sidebar + topbar for all protected pages.
 * AC-108: sidebar not rendered for unauthenticated requests (they get redirected).
 */

import { useEffect, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/shell/Sidebar'
import { Topbar } from '@/shell/Topbar'
import { useAuth } from '@/lib/hooks/useAuth'
import { getSession } from '@/lib/api/identity'

type AuthState = 'checking' | 'authenticated' | 'unauthenticated'

type AuthStateAction = { type: AuthState }

function authStateReducer(_prev: AuthState, action: AuthStateAction): AuthState {
  return action.type
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { session, isLoading, removeSession } = useAuth()
  const [authState, dispatch] = useReducer(authStateReducer, 'checking')

  useEffect(() => {
    if (isLoading) return

    if (!session?.token) {
      router.replace('/sign-in')
      dispatch({ type: 'unauthenticated' })
      return
    }

    // Validate session against identity service to catch expired tokens (AC-019)
    getSession(session.token)
      .then(() => dispatch({ type: 'authenticated' }))
      .catch(() => {
        removeSession()
        router.replace('/sign-in')
        dispatch({ type: 'unauthenticated' })
      })
  }, [session, isLoading, router, removeSession])

  // Show loading spinner while checking auth to avoid layout flash
  if (authState === 'checking') {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="sr-only">Loading…</span>
        <span
          className="h-8 w-8 animate-spin rounded-full border-4 border-teal-700 border-t-transparent"
          aria-hidden="true"
        />
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return null
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
