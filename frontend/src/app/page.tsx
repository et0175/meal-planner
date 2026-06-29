'use client'

/**
 * Root route redirect.
 *
 * Authenticated (token in sessionStorage) → /planner
 * Unauthenticated → /sign-in
 *
 * Must be a Client Component because sessionStorage is client-only.
 * AC-021: authenticated → Meal Planner screen rendered
 * AC-109: unauthenticated → redirected to sign-in
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredToken } from '@/lib/hooks/useAuth'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const token = getStoredToken()
    if (token) {
      router.replace('/planner')
    } else {
      router.replace('/sign-in')
    }
  }, [router])

  return null
}
