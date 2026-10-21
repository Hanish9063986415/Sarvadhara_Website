'use client'

import { formatInr } from '@/lib/format-currency'
import { maintenanceRemainingDue } from '@/lib/maintenance-ledger-calc'
import { formatCrmDate, formatCrmMonthShort } from '@/lib/crm-dates'
import { formatMonthLabel, parseMonthKey } from '@/lib/maintenance-schedule'
import type { MaintenancePaymentStatus, MaintenanceProjectHistoryEntry } from '@/types/crm-maintenance-record'

function statusStyles(status: MaintenancePaymentStatus): string {
  if (status === 'paid') return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100'
  if (status === 'partial') return 'border-amber-400/30 bg-amber-500/15 text-amber-100'
  return 'border-red-400/25 bg-red-500/10 text-red-100/90'
}

function statusLabel(status: MaintenancePaymentStatus): string {
  if (status === 'paid') return 'Paid'
  if (status === 'partial') return 'Partial'
  return 'Unpaid'
}

function periodShortLabel(periodKey: string): string {
  const { year, monthIndex } = parseMonthKey(periodKey)
  return formatCrmMonthShort(year, monthIndex)
}

export default function MaintenanceProjectHistoryTable({
  entries,
  highlightPeriodKey,
}: {
  entries: MaintenanceProjectHistoryEntry[]
  highlightPeriodKey?: string
}) {
  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-10 text-center text-sm text-platinum-500">
        No maintenance months recorded yet for this project.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03] text-[9px] uppercase tracking-wider text-platinum-600">
            <th className="px-4 py-3 font-normal">Month</th>
            <th className="px-4 py-3 text-right font-normal">Retainer</th>
            <th className="px-4 py-3 text-right font-normal">Carry</th>
                            <th className="px-4 py-3 text-right font-normal">Due now</th>
            <th className="px-4 py-3 text-right font-normal">Paid</th>
            <th className="px-4 py-3 text-right font-normal">Balance</th>
            <th className="px-4 py-3 font-normal">Paid on</th>
            <th className="px-4 py-3 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const { year, monthIndex } = parseMonthKey(entry.periodKey)
            const highlighted = highlightPeriodKey === entry.periodKey
            return (
              <tr
                key={entry.periodKey}
                className={`border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] ${
                  highlighted ? 'bg-amber-500/[0.08]' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-platinum-200">{formatMonthLabel(year, monthIndex)}</p>
                  <p className="text-[10px] text-platinum-600">{periodShortLabel(entry.periodKey)}</p>
                  {highlighted ? (
                    <p className="mt-0.5 text-[9px] uppercase tracking-wider text-amber-200/90">Selected month</p>
                  ) : null}
                </td>
                <td className="crm-stat-sm px-4 py-3 text-right text-platinum-400">{formatInr(entry.monthlyFee)}</td>
                <td
                  className={`crm-stat-sm px-4 py-3 text-right ${
                    entry.carryIn > 0 ? 'text-amber-200' : 'text-platinum-500'
                  }`}
                >
                  {formatInr(entry.carryIn)}
                </td>
                                  <td
                                    className={`crm-stat-sm px-4 py-3 text-right ${
                                      entry.status === 'paid' ? 'text-emerald-200' : 'text-platinum-200'
                                    }`}
                                  >
                                    {formatInr(maintenanceRemainingDue(entry))}
                                  </td>
                <td className="crm-stat-sm px-4 py-3 text-right text-emerald-100">{formatInr(entry.paidAmount)}</td>
                <td
                  className={`crm-stat-sm px-4 py-3 text-right ${
                    entry.balance > 0 ? 'text-red-200/90' : 'text-platinum-500'
                  }`}
                >
                  {formatInr(entry.balance)}
                </td>
                <td className="px-4 py-3 text-xs text-platinum-400">{formatCrmDate(entry.paidOn)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-wider ${statusStyles(entry.status)}`}
                  >
                    {statusLabel(entry.status)}
                  </span>
                  {entry.note ? (
                    <p className="mt-1 max-w-[140px] truncate text-[10px] text-platinum-600" title={entry.note}>
                      {entry.note}
                    </p>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
