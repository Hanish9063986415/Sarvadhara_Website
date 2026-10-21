'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  Loader2,
  PauseCircle,
  Receipt,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import {
  type AutomateAlertKind,
  type AutomateAlertUrgency,
  type AutomateOverviewAlert,
  type AutomateOverviewAlertsPayload,
} from '@/lib/automate-overview-alerts'
import { formatInr } from '@/lib/format-currency'

type FilterId = 'all' | AutomateAlertKind

const KIND_META: Record<
  AutomateAlertKind,
  { label: string; icon: typeof Bell; tone: string; filterLabel: string }
> = {
  expense: { label: 'Expense', icon: Receipt, tone: 'text-violet-200', filterLabel: 'Expenses' },
  maintenance: { label: 'Maintenance', icon: CalendarClock, tone: 'text-amber-200', filterLabel: 'Maintenance' },
  project_payment: { label: 'Contract', icon: CircleDollarSign, tone: 'text-sky-200', filterLabel: 'Contracts' },
  project_status: { label: 'Track', icon: PauseCircle, tone: 'text-platinum-300', filterLabel: 'Track' },
}

function urgencyStyles(urgency: AutomateAlertUrgency): string {
  if (urgency === 'critical') {
    return 'border-red-400/35 bg-gradient-to-br from-red-500/18 via-red-500/5 to-transparent'
  }
  if (urgency === 'warning') {
    return 'border-amber-400/35 bg-gradient-to-br from-amber-500/16 via-amber-500/5 to-transparent'
  }
  return 'border-violet-400/22 bg-gradient-to-br from-violet-500/10 to-transparent'
}

function AlertRow({ alert, index }: { alert: AutomateOverviewAlert; index: number }) {
  const meta = KIND_META[alert.kind]
  const Icon = meta.icon

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.35 }}
    >
      <Link
        href={alert.href}
        className={`group flex items-stretch gap-3 rounded-xl border p-3.5 sm:p-4 transition-all hover:border-white/25 hover:bg-white/[0.03] ${urgencyStyles(alert.urgency)}`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/25">
          <Icon className={`h-5 w-5 ${meta.tone}`} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-platinum-500">{meta.label}</span>
            {alert.badge ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-platinum-400">
                {alert.badge}
              </span>
            ) : null}
            {alert.urgency === 'critical' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-red-200">
                <AlertTriangle className="h-3 w-3" aria-hidden />
                Urgent
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 font-luxury text-base text-platinum-metallic truncate sm:text-lg">{alert.title}</p>
          <p className="mt-1 text-sm text-platinum-300 line-clamp-2">{alert.message}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end justify-between gap-2 pl-1">
          {typeof alert.amount === 'number' && alert.amount > 0 ? (
            <p className="crm-stat-sm text-right">{formatInr(alert.amount)}</p>
          ) : (
            <span className="h-5" />
          )}
          <ChevronRight className="h-4 w-4 text-platinum-500 transition-transform group-hover:translate-x-0.5 group-hover:text-platinum-metallic" />
        </div>
      </Link>
    </motion.li>
  )
}

const URGENCY_SECTIONS: { id: AutomateAlertUrgency; title: string }[] = [
  { id: 'critical', title: 'Urgent' },
  { id: 'warning', title: 'Needs attention' },
  { id: 'info', title: 'Upcoming & info' },
]

export default function AutomateOverviewAlertsSection() {
  const [payload, setPayload] = useState<AutomateOverviewAlertsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterId>('all')

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/automate/overview-alerts')
      if (!res.ok) {
        setError('Could not load notifications.')
        setPayload(null)
        return
      }
      const data = (await res.json()) as AutomateOverviewAlertsPayload
      setPayload(data)
    } catch {
      setError('Could not load notifications.')
      setPayload(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filteredAlerts = useMemo(() => {
    if (!payload) return []
    if (filter === 'all') return payload.alerts
    return payload.alerts.filter((a) => a.kind === filter)
  }, [payload, filter])

  const filterCounts = useMemo(() => {
    if (!payload) return { all: 0, expense: 0, maintenance: 0, project_payment: 0, project_status: 0 }
    const alerts = payload.alerts
    return {
      all: alerts.length,
      expense: alerts.filter((a) => a.kind === 'expense').length,
      maintenance: alerts.filter((a) => a.kind === 'maintenance').length,
      project_payment: alerts.filter((a) => a.kind === 'project_payment').length,
      project_status: alerts.filter((a) => a.kind === 'project_status').length,
    }
  }, [payload])

  const filters: { id: FilterId; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: filterCounts.all },
    { id: 'maintenance', label: 'Maintenance', count: filterCounts.maintenance },
    { id: 'expense', label: 'Expenses', count: filterCounts.expense },
    { id: 'project_payment', label: 'Contracts', count: filterCounts.project_payment },
    { id: 'project_status', label: 'Track', count: filterCounts.project_status },
  ]

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#0c0c10] shadow-[0_0_80px_-20px_rgba(139,92,246,0.25)]"
      aria-labelledby="automate-overview-alerts-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-violet-500/12 via-amber-500/5 to-transparent"
        aria-hidden
      />

      <header className="relative border-b border-white/10 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/15">
                <Bell className="h-5 w-5 text-violet-100" aria-hidden />
              </div>
              <div>
                <h2 id="automate-overview-alerts-heading" className="font-luxury text-2xl text-platinum-metallic sm:text-3xl">
                  Notifications & reminders
                </h2>
                <p className="mt-0.5 text-sm text-platinum-500">Your command center for what needs action today</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-platinum-400 transition-colors hover:border-white/20 hover:text-platinum-metallic disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden />
              Refresh
            </button>
          </div>
        </div>

        {!loading && payload ? (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {payload.counts.critical > 0 ? (
              <span className="rounded-full border border-red-400/30 bg-red-500/15 px-3 py-1 text-xs font-medium text-red-100">
                {payload.counts.critical} urgent
              </span>
            ) : null}
            {payload.counts.warning > 0 ? (
              <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-100">
                {payload.counts.warning} attention
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-platinum-400">
              {payload.monthLabel}
            </span>
            {payload.clearanceLabel ? (
              <span className="text-xs text-platinum-500">
                Clear maintenance by{' '}
                <span className="text-amber-100/90">{payload.clearanceLabel}</span>
              </span>
            ) : null}
          </div>
        ) : null}

        {!loading && payload && payload.alerts.length > 0 ? (
          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  filter === f.id
                    ? 'border-violet-400/40 bg-violet-500/20 text-violet-100'
                    : 'border-white/10 bg-white/[0.03] text-platinum-500 hover:border-white/15 hover:text-platinum-300'
                }`}
              >
                {f.label}
                {f.count > 0 ? <span className="ml-1.5 opacity-70">({f.count})</span> : null}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <div className="relative px-4 py-4 sm:px-6 sm:py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-platinum-500">
            <Loader2 className="h-8 w-8 animate-spin text-violet-300/80" aria-hidden />
            Loading your alerts…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-4 text-sm text-red-100">
            {error}{' '}
            <button type="button" onClick={load} className="underline hover:text-white">
              Retry
            </button>
          </div>
        ) : payload && filteredAlerts.length > 0 ? (
          <div className="space-y-6">
            {filter === 'all'
              ? URGENCY_SECTIONS.map((section) => {
                  const sectionAlerts = filteredAlerts.filter((a) => a.urgency === section.id)
                  if (sectionAlerts.length === 0) return null
                  return (
                    <div key={section.id}>
                      <h3 className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-platinum-500">
                        {section.title}
                      </h3>
                      <ul className="space-y-2.5">
                        {sectionAlerts.map((alert, index) => (
                          <AlertRow key={alert.id} alert={alert} index={index} />
                        ))}
                      </ul>
                    </div>
                  )
                })
              : (
                  <ul className="space-y-2.5">
                    {filteredAlerts.map((alert, index) => (
                      <AlertRow key={alert.id} alert={alert} index={index} />
                    ))}
                  </ul>
                )}
          </div>
        ) : payload && payload.alerts.length > 0 && filteredAlerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-platinum-500">No alerts in this category.</p>
        ) : (
          <div className="rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/12 to-transparent px-4 py-8 sm:px-8 sm:py-10">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-500/10">
                <Sparkles className="h-7 w-7 text-emerald-200" aria-hidden />
              </div>
              <p className="mt-4 font-luxury text-xl text-platinum-metallic">All clear for now</p>
              <p className="mt-2 text-sm text-platinum-400 leading-relaxed">
                No overdue expenses, maintenance dues, or contract reminders. We will surface new alerts here as dates
                approach.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
