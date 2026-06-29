'use client'

/**
 * Sign-in page.
 *
 * Calls POST /auth/sign-in via lib/api/identity.ts
 * Stores session token in sessionStorage via useAuth hook.
 * Shows 401 and 429 errors.
 * AC-018 / AC-019 support: auth guard handles redirect when session is missing/expired.
 */

import { type FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UtensilsCrossed } from 'lucide-react'
import { signIn, isApiError } from '@/lib/api/identity'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignInPage() {
  const router = useRouter()
  const { session, isLoading, saveSession } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [globalError, setGlobalError] = useState('')
  const [isPending, setIsPending] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && session) {
      router.replace('/planner')
    }
  }, [session, isLoading, router])

  function validate(): boolean {
    let valid = true
    if (!email.trim()) {
      setEmailError('Email is required')
      valid = false
    } else {
      setEmailError('')
    }
    if (!password) {
      setPasswordError('Password is required')
      valid = false
    } else {
      setPasswordError('')
    }
    return valid
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setGlobalError('')
    if (!validate()) return

    setIsPending(true)
    try {
      const result = await signIn({ email: email.trim(), password })
      saveSession({
        token: result.token,
        accountId: result.account_id,
        email: email.trim(),
        role: result.role,
      })
      router.push('/planner')
    } catch (err) {
      if (isApiError(err)) {
        if (err.status === 401) {
          setGlobalError('Invalid email or password.')
        } else if (err.status === 429) {
          const minutes = err.retryAfter ? Math.ceil(err.retryAfter / 60) : 60
          setGlobalError(
            `Too many failed attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
          )
        } else {
          setGlobalError(err.detail)
        }
      } else {
        setGlobalError('Unable to connect. Please try again.')
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-700">
          <UtensilsCrossed size={20} className="text-white" aria-hidden="true" />
        </div>
        <span className="text-xl font-semibold text-gray-900 tracking-tight">Meal Forge</span>
      </div>

      <div className="bg-white rounded-2xl shadow-xl px-6 py-7">
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back to Meal Forge</p>
        </div>

        {globalError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) setEmailError('')
            }}
            error={emailError}
            required
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (passwordError) setPasswordError('')
            }}
            error={passwordError}
            required
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-gray-500 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
              >
                {showPassword ? (
                  <EyeOff size={15} aria-hidden="true" />
                ) : (
                  <Eye size={15} aria-hidden="true" />
                )}
              </button>
            }
          />

          <Button type="submit" fullWidth isLoading={isPending}>
            Sign in
          </Button>
        </form>

        <div className="mt-4 space-y-2 text-center text-sm">
          <Link
            href="/forgot-password"
            className="block text-teal-700 hover:text-teal-900 focus-visible:outline-none focus-visible:underline"
          >
            Forgot password?
          </Link>
          <p className="text-gray-500">
            No account?{' '}
            <Link
              href="/register"
              className="font-medium text-teal-700 hover:text-teal-900 focus-visible:outline-none focus-visible:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
