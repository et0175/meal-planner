'use client'

/**
 * Sidebar — main navigation for the (app) shell.
 *
 * Renders all three modules with active-state highlight based on current pathname.
 * Not rendered for anonymous users (the (app)/layout.tsx auth guard handles that).
 *
 * AC-020: authenticated user on any screen → sidebar shows all modules with active-state highlight
 * AC-108: unauthenticated request → sidebar not rendered (enforced by auth guard, not here)
 */

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarDays, ShoppingBasket, Apple, LogOut, UtensilsCrossed, User } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { signOut } from '@/lib/api/identity'
import { useAuth } from '@/lib/hooks/useAuth'

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs))
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/planner',
    label: 'Planner',
    icon: <CalendarDays size={18} aria-hidden="true" />,
  },
  {
    href: '/products',
    label: 'Products',
    icon: <Apple size={18} aria-hidden="true" />,
  },
  {
    href: '/shopping',
    label: 'Shopping list',
    icon: <ShoppingBasket size={18} aria-hidden="true" />,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { session, removeSession } = useAuth()

  async function handleSignOut() {
    if (session?.token) {
      try {
        await signOut(session.token)
      } catch {
        // Token may already be invalid — proceed with local clear
      }
    }
    removeSession()
    router.push('/sign-in')
  }

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-full"
      style={{ background: '#1A6B6E' }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <UtensilsCrossed size={16} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-white font-semibold text-base tracking-tight">Meal Forge</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5" aria-label="Site sections">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                isActive
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              )}
            >
              <span className={isActive ? 'text-teal-600' : 'opacity-70'}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 pb-5 pt-3 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-2 min-w-0 px-1">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <User size={12} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-white/70 text-xs truncate flex-1" title={session?.email}>
            {session?.email ?? ''}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg',
            'text-white/60 hover:text-white hover:bg-white/10',
            'text-xs transition-colors cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60'
          )}
        >
          <LogOut size={13} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
