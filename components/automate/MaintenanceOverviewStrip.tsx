'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatInr } from '@/lib/format-currency'
import { maintenanceGstBreakdown } from '@/lib/maintenance-gst'

export type MaintenanceFilter = 'all' | 'paid' | 'unpaid' | 'partial'

type StripStats = {
  totalDue: number
  totalPaid: number
  totalOutstanding: number
  totalCarryIn: number
  totalMonthlyFees: number
  projectCount: number
  paidProjects: number
  unpaidProjects: number
  partialProjects: number
}

export default function MaintenanceOverviewStrip({
  monthLabel,
  loading,
  stats,
  filter,
  onFilterChange,
  onPrevMonth,
  onNextMonth,
  clearanceDay,
  clearanceLabel,
  onClearanceDayChange,
  savingClearanceDay,
}: {
  monthLabel: string
  loading: boolean
  stats: StripStats | null
  filter: MaintenanceFilter
  onFilterChange: (f: MaintenanceFilter) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  clearanceDay: number
  clearanceLabel: string
  onClearanceDayChange: (day: number) => void
  savingClearanceDay?: boolean
}) {
  const [dayDraft, setDayDraft] = useState(clearanceDay)
  useEffect(() => {
    setDayDraft(clearanceDay)
  }, [clearanceDay])

  const dueIncl = stats ? maintenanceGstBreakdown(stats.totalDue).totalInclGst : 0
  const paidIncl = stats ? maintenanceGstBreakdown(stats.totalPaid).totalInclGst : 0
  const outstandingIncl = stats ? maintenanceGstBreakdown(stats.totalOutstanding).totalInclGst : 0

  const chips: { id: MaintenanceFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All projects', count: stats?.projectCount ?? 0 },
    { id: 'paid', label: 'Paid', count: stats?.paidProjects ?? 0 },
    { id: 'unpaid', label: 'Unpaid', count: stats?.unpaidProjects ?? 0 },
    { id: 'partial', label: 'Partial', count: stats?.partialProjects ?? 0 },
  ]

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-500/[0.12] via-violet-500/[0.06] to-transparent">
      <div className="flex flex-col gap-4 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-platinum-500">Maintenance overview</p>
          <h2 className="font-luxury text-xl text-platinum-metallic sm:text-2xl">{monthLabel}</h2>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-platinum-600">Clear all maintenance by</p>
              <p className="crm-stat-sm mt-0.5 text-amber-100">{clearanceLabel}</p>
            </div>
            <div>
              <label className="crm-label sr-only" htmlFor="maintenance-clearance-day">
                Clearance day each month
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-platinum-600">Day</span>
                <input
                  id="maintenance-clearance-day"
                  type="number"
                  min={1}
                  max={28}
                  disabled={savingClearanceDay}
                  className="crm-input w-16 tabular-nums py-1.5 text-sm"
                  value={dayDraft}
                  onChange={(e) => setDayDraft(Number(e.target.value))}
                  onBlur={() => onClearanceDayChange(dayDraft)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onPrevMonth}
            className="rounded-lg border border-white/10 p-2 text-platinum-500 hover:bg-white/5 hover:text-platinum-metallic"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="rounded-lg border border-white/10 p-2 text-platinum-500 hover:bg-white/5 hover:text-platinum-metallic"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-white/[0.06] border-b border-white/10 xs:grid-cols-2 xs:divide-x xs:divide-y-0 sm:grid-cols-3 lg:grid-cols-5">
        {[
          {
            label: 'Due now (incl. 18% IGST)',
            value: stats ? formatInr(dueIncl) : '—',
            hint: stats ? `Ex-GST ${formatInr(stats.totalDue)}` : 'Still to collect',
          },
          {
            label: 'Paid (incl. IGST)',
            value: stats ? formatInr(paidIncl) : '—',
            hint: stats ? `Ex-GST ${formatInr(stats.totalPaid)} recorded` : 'Recorded',
          },
          {
            label: 'Outstanding (incl. IGST)',
            value: stats ? formatInr(outstandingIncl) : '—',
            hint: stats ? `Ex-GST ${formatInr(stats.totalOutstanding)} rolls forward` : 'Rolls forward',
          },
          { label: 'Carried in', value: stats ? formatInr(stats.totalCarryIn) : '—', hint: 'From prior months' },
          {
            label: 'Projects',
            value: stats ? `${stats.paidProjects}/${stats.projectCount} paid` : '—',
            hint: stats ? `${stats.unpaidProjects} with balance` : '',
          },
        ].map((cell) => (
          <div key={cell.label} className="px-4 py-4 sm:px-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-platinum-500">{cell.label}</p>
            <p className="mt-1 crm-stat-md text-platinum-100">{loading ? '…' : cell.value}</p>
            {cell.hint && <p className="mt-0.5 text-[10px] text-platinum-600">{cell.hint}</p>}
          </div>
        ))}
      </div>

      <div className="horizontal-scroll-tabs flex-nowrap items-center gap-2 px-4 py-3 sm:flex-wrap sm:overflow-visible sm:px-6">
        <span className="shrink-0 self-center text-[10px] uppercase tracking-wider text-platinum-600">Show</span>
        {chips.map((chip) => {
          const active = filter === chip.id
          const tone =
            chip.id === 'paid'
              ? active
                ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100'
                : 'border-white/10 text-platinum-400 hover:border-emerald-400/25'
              : chip.id === 'unpaid'
                ? active
                  ? 'border-red-400/35 bg-red-500/15 text-red-100'
                  : 'border-white/10 text-platinum-400 hover:border-red-400/25'
                : chip.id === 'partial'
                  ? active
                    ? 'border-amber-400/40 bg-amber-500/15 text-amber-100'
                    : 'border-white/10 text-platinum-400 hover:border-amber-400/25'
                  : active
                    ? 'border-violet-400/40 bg-violet-500/15 text-violet-100'
                    : 'border-white/10 text-platinum-400 hover:border-violet-400/25'
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onFilterChange(chip.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] uppercase tracking-wider transition-colors min-h-[44px] ${tone}`}
            >
              {chip.label}
              <span className="crm-stat-sm text-[10px] opacity-90">{chip.count}</span>
            </button>
          )
        })}
      </div>

      {stats && stats.totalOutstanding > 0 && (
        <p className="border-t border-white/[0.06] px-4 py-2.5 text-center text-[11px] text-amber-200/85 sm:px-6">
          Unpaid balances ({formatInr(stats.totalOutstanding)}) carry forward into the next billing month automatically.
        </p>
      )}
    </section>
  )
}
