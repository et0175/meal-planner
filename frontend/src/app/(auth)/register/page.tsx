'use client'

/**
 * Register page.
 *
 * Calls POST /auth/register via lib/api/identity.ts
 * Shows validation errors (409 conflict → neutral message to avoid enumeration).
 * On success, redirects to sign-in for the user to log in.
 */

import { type FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UtensilsCrossed } from 'lucide-react'
import { register, isApiError } from '@/lib/api/identity'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RegisterPage() {
  const router = useRouter()
  const { session, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [globalError, setGlobalError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address')
      valid = false
    } else {
      setEmailError('')
    }
    if (!password) {
      setPasswordError('Password is required')
      valid = false
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      valid = false
    } else {
      setPasswordError('')
    }
    return valid
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setGlobalError('')
    setSuccessMsg('')
    if (!validate()) return

    setIsPending(true)
    try {
      await register({ email: email.trim(), password })
      router.push('/sign-in')
    } catch (err) {
      if (isApiError(err)) {
        if (err.status === 409) {
          // Do not reveal email existence — neutral message
          setSuccessMsg(
            'If this email is available, your account has been created. Try signing in.'
          )
        } else if (err.status === 422) {
          setGlobalError('Please check your email and password and try again.')
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
          <h1 className="text-lg font-semibold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-0.5">Start planning your meals</p>
        </div>

        {successMsg && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700"
          >
            {successMsg}
          </div>
        )}

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (passwordError) setPasswordError('')
            }}
            error={passwordError}
            hint="At least 8 characters"
            required
            placeholder="Minimum 8 characters"
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
            Create account
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-500">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="font-medium text-teal-700 hover:text-teal-900 focus-visible:outline-none focus-visible:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
