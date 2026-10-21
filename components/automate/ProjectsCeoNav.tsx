'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarClock, FolderKanban, LayoutGrid, Receipt, TrendingUp } from 'lucide-react'
import {
  AUTOMATE_PROJECTS_EXPENSES_PATH,
  AUTOMATE_PROJECTS_MAINTENANCE_PATH,
  AUTOMATE_PROJECTS_PATH,
  AUTOMATE_PROJECTS_TRACK_PATH,
  AUTOMATE_PROJECTS_VAULT_PATH,
} from '@/lib/automate-routes'

const tabs = [
  { label: 'Workspace', href: AUTOMATE_PROJECTS_PATH, icon: LayoutGrid, exact: true },
  { label: 'Payments vault', href: AUTOMATE_PROJECTS_VAULT_PATH, icon: FolderKanban },
  { label: 'Project track', href: AUTOMATE_PROJECTS_TRACK_PATH, icon: TrendingUp },
  { label: 'Maintenance', href: AUTOMATE_PROJECTS_MAINTENANCE_PATH, icon: CalendarClock },
  { label: 'Expenses', href: AUTOMATE_PROJECTS_EXPENSES_PATH, icon: Receipt },
]

export default function ProjectsCeoNav() {
  const pathname = usePathname()

  return (
    <nav
      className="horizontal-scroll-tabs mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 sm:flex-wrap sm:overflow-visible"
      aria-label="Projects workspace"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const onRecord =
          tab.href === AUTOMATE_PROJECTS_TRACK_PATH &&
          /^\/automate\/projects\/(?!login$|vault|track|maintenance|expenses|new$)[^/]+$/.test(pathname)
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href) || onRecord
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs sm:text-sm transition-colors min-h-[44px] ${
              active
                ? 'bg-gradient-to-r from-platinum-metallic/15 to-white/[0.06] text-platinum-metallic border border-white/15 shadow-lg shadow-black/20'
                : 'text-platinum-500 hover:text-platinum-metallic hover:bg-white/[0.04]'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
