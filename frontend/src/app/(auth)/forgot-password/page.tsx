'use client'

/**
 * Forgot password page.
 *
 * Calls POST /auth/reset-request via lib/api/identity.ts
 * Always shows a neutral success message regardless of whether the email
 * is registered (no email enumeration — AC-017 / ADR-0005).
 */

import { type FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UtensilsCrossed } from 'lucide-react'
import { resetRequest } from '@/lib/api/identity'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { session, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isPending, setIsPending] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && session) {
      router.replace('/planner')
    }
  }, [session, isLoading, router])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setEmailError('Email is required')
      return
    }
    setEmailError('')
    setSuccessMsg('')

    setIsPending(true)
    try {
      await resetRequest(email.trim())
    } catch {
      // Swallow all errors — always show neutral message (AC-017)
    } finally {
      setIsPending(false)
    }
    setSuccessMsg(
      'If an account with this email exists, a reset link has been sent. Check your inbox.'
    )
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
          <h1 className="text-lg font-semibold text-gray-900">Reset password</h1>
          <p className="text-sm text-gray-500 mt-0.5">Enter your email to receive a reset link</p>
        </div>

        {successMsg && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700"
          >
            {successMsg}
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

          <Button type="submit" fullWidth isLoading={isPending}>
            Send reset link
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link
            href="/sign-in"
            className="text-teal-700 hover:text-teal-900 focus-visible:outline-none focus-visible:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
