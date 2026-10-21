'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarClock, FolderKanban, Plus, Receipt, TrendingUp } from 'lucide-react'
import {
  AUTOMATE_PROJECTS_EXPENSES_PATH,
  AUTOMATE_PROJECTS_MAINTENANCE_PATH,
  AUTOMATE_PROJECTS_NEW_PATH,
  AUTOMATE_PROJECTS_TRACK_PATH,
  AUTOMATE_PROJECTS_VAULT_PATH,
} from '@/lib/automate-routes'
import { formatInr } from '@/lib/format-currency'
import { useCrmProjects } from '@/components/automate/useCrmProjects'
import { totalMaintenanceDue } from '@/lib/maintenance-schedule'
const modules = [
  {
    title: 'Payments vault',
    description: 'Add and edit contracts, payments, and balances. Only an admin can delete a project.',
    href: AUTOMATE_PROJECTS_VAULT_PATH,
    icon: FolderKanban,
    accent: 'from-blue-500/10 to-transparent border-blue-400/20',
  },
  {
    title: 'Project track',
    description: 'Delivery phase, progress %, and status across every engagement.',
    href: AUTOMATE_PROJECTS_TRACK_PATH,
    icon: TrendingUp,
    accent: 'from-violet-500/10 to-transparent border-violet-400/20',
  },
  {
    title: 'Maintenance',
    description: 'Monthly retainers, billing dates, and upcoming dues in one schedule.',
    href: AUTOMATE_PROJECTS_MAINTENANCE_PATH,
    icon: CalendarClock,
    accent: 'from-amber-500/10 to-transparent border-amber-400/20',
  },
  {
    title: 'Monthly expenses',
    description: 'Recurring costs, due-day reminders, and 2–3 day advance alerts.',
    href: AUTOMATE_PROJECTS_EXPENSES_PATH,
    icon: Receipt,
    accent: 'from-rose-500/10 to-transparent border-rose-400/20',
  },
]

export default function ProjectsHub() {
  const { projects, loading } = useCrmProjects()

  const avgProgress =
    projects.length === 0
      ? 0
      : Math.round(projects.reduce((s, p) => s + p.progressPercent, 0) / projects.length)
  const monthlyDue = totalMaintenanceDue(projects)
  const activeMaintenance = projects.filter((p) => p.maintenanceEnabled && p.maintenanceMonthlyAmount > 0).length

  return (
    <div className="automate-page-container mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-platinum-500">Projects workspace</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm text-platinum-400 max-w-xl leading-relaxed">
            Anyone signed in to Automate can add and edit projects. Deleting a project needs the admin login.
          </p>
          <Link
            href={AUTOMATE_PROJECTS_NEW_PATH}
            className="inline-flex items-center gap-2 rounded-xl border border-platinum-300/30 bg-platinum-metallic/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-metallic hover:bg-platinum-metallic/15"
          >
            <Plus className="h-4 w-4" />
            New projects
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Projects', value: loading ? '…' : String(projects.length) },
          { label: 'Avg. progress', value: loading ? '…' : `${avgProgress}%` },
          { label: 'Maintenance plans', value: loading ? '…' : String(activeMaintenance) },
          { label: 'Monthly due (all)', value: loading ? '…' : formatInr(monthlyDue) },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent px-4 py-4"
          >
            <p className="text-[10px] uppercase tracking-[0.14em] text-platinum-500">{card.label}</p>
            <p className="mt-1 crm-stat-md">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((mod, i) => {
          const Icon = mod.icon
          return (
            <motion.div
              key={mod.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={mod.href}
                className={`group flex h-full flex-col rounded-2xl border bg-gradient-to-br p-6 hover:border-white/25 transition-all ${mod.accent}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                  <Icon className="w-5 h-5 text-platinum-metallic" />
                </div>
                <h2 className="mt-4 font-luxury text-lg text-platinum-metallic">{mod.title}</h2>
                <p className="mt-2 text-sm text-platinum-500 leading-relaxed flex-1">{mod.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-platinum-400 group-hover:text-platinum-metallic">
                  Open
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
