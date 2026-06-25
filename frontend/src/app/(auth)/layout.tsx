/**
 * Auth layout — public pages with no shell.
 * Renders sign-in, register, and forgot-password with a centered card layout.
 */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gray-100">{children}</div>
  )
}
