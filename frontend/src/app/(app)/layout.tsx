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
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/shell/Sidebar'
import { Topbar } from '@/shell/Topbar'
import { useAuth } from '@/lib/hooks/useAuth'
import { getSession, isApiError } from '@/lib/api/identity'

type AuthState = 'checking' | 'authenticated' | 'unauthenticated'

type AuthStateAction = { type: AuthState }

function authStateReducer(_prev: AuthState, action: AuthStateAction): AuthState {
  return action.type
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
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
    const controller = new AbortController()

    getSession(session.token, controller.signal)
      .then(() => dispatch({ type: 'authenticated' }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          // Stale request cancelled — ignore entirely
          return
        }
        if (isApiError(err) && err.status === 401) {
          // Confirmed invalid token — log out
          removeSession()
          router.replace('/sign-in')
          dispatch({ type: 'unauthenticated' })
        } else {
          // Transient error (5xx, network) — assume token still valid
          dispatch({ type: 'authenticated' })
        }
      })

    return () => controller.abort()
  }, [session, isLoading, router, removeSession, pathname])

  // Show loading spinner while checking auth to avoid layout flash
  if (authState === 'checking') {
    return (
      <div className="flex h-full items-center justify-center" role="status">
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:text-teal-800 focus:font-medium"
      >
        Skip to main content
      </a>
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
