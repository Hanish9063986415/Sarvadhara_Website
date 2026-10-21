'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarClock, FolderKanban, LayoutDashboard, LogOut, Receipt, Sparkles, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { formatCrmTodayLong } from '@/lib/crm-dates'
import {
  AUTOMATE_BASE_PATH,
  AUTOMATE_PROJECTS_EXPENSES_PATH,
  AUTOMATE_PROJECTS_MAINTENANCE_PATH,
  AUTOMATE_PROJECTS_TRACK_PATH,
  AUTOMATE_PROJECTS_VAULT_PATH,
} from '@/lib/automate-routes'

const navItems = [
  { label: 'Overview', shortLabel: 'Home', href: AUTOMATE_BASE_PATH, icon: LayoutDashboard, exact: true },
  { label: 'Project track', shortLabel: 'Track', href: AUTOMATE_PROJECTS_TRACK_PATH, icon: TrendingUp },
  { label: 'Maintenance', shortLabel: 'Maint.', href: AUTOMATE_PROJECTS_MAINTENANCE_PATH, icon: CalendarClock },
  { label: 'Monthly expenses', shortLabel: 'Expenses', href: AUTOMATE_PROJECTS_EXPENSES_PATH, icon: Receipt },
  { label: 'Payments vault', shortLabel: 'Vault', href: AUTOMATE_PROJECTS_VAULT_PATH, icon: FolderKanban, restricted: true },
]

function navActive(pathname: string, item: (typeof navItems)[number]): boolean {
  const onRecord =
    item.href === AUTOMATE_PROJECTS_TRACK_PATH &&
    /^\/automate\/projects\/(?!login$|vault|track|maintenance|expenses|new$)[^/]+$/.test(pathname)
  return 'exact' in item && item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`) || onRecord
}

export default function AutomateShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/automate/auth/logout', { method: 'POST' })
      router.push(`${AUTOMATE_BASE_PATH}/login`)
      router.refresh()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="flex min-h-screen min-w-0">
      <aside className="no-print hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0c]">
        <div className="px-6 py-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-platinum-metallic" />
            <span className="text-xl font-luxury text-platinum-metallic tracking-wide">Automate</span>
          </div>
          <p className="mt-2 text-xs text-platinum-500 tracking-wide">Sarvadhara CRM</p>
          <p className="mt-3 text-[11px] leading-snug text-platinum-600">{formatCrmTodayLong()}</p>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = navActive(pathname, item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-white/[0.06] text-platinum-metallic border border-white/10'
                    : 'text-platinum-400 hover:bg-white/[0.04] hover:text-platinum-metallic'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
                {'restricted' in item && item.restricted && (
                  <span className="ml-auto text-[9px] uppercase tracking-wider text-amber-400/80">CEO</span>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full min-h-[44px] items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-platinum-400 hover:bg-white/[0.04] hover:text-platinum-metallic transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0c]/95 backdrop-blur-md lg:static lg:bg-[#0a0a0c]">
          <div className="flex items-start justify-between gap-3 px-4 py-4 lg:px-8">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2 lg:hidden">
                <Sparkles className="h-4 w-4 shrink-0 text-platinum-metallic" />
                <span className="font-luxury text-platinum-metallic">Automate</span>
              </div>
              <h1 className="truncate font-luxury text-lg text-platinum-metallic xs:text-xl sm:text-2xl">{title}</h1>
              {subtitle ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-platinum-500 sm:text-sm">{subtitle}</p>
              ) : null}
              <p className="mt-1 text-[11px] text-platinum-600 lg:hidden">{formatCrmTodayLong()}</p>
            </div>
            <p className="hidden max-w-[240px] shrink-0 text-right text-[11px] leading-snug text-platinum-600 lg:block">
              {formatCrmTodayLong()}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-[10px] uppercase tracking-wider text-platinum-500 transition-colors hover:text-platinum-metallic lg:hidden min-h-[44px]"
            >
              {loggingOut ? '…' : 'Out'}
            </button>
          </div>
          <nav className="horizontal-scroll-tabs border-t border-white/[0.06] px-4 py-2.5 lg:hidden" aria-label="Automate sections">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = navActive(pathname, item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors min-h-[44px] ${
                    active
                      ? 'border border-white/15 bg-white/[0.08] text-platinum-metallic'
                      : 'border border-transparent text-platinum-500 hover:bg-white/[0.04] hover:text-platinum-300'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.shortLabel}</span>
                </Link>
              )
            })}
          </nav>
        </header>
        <div className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
