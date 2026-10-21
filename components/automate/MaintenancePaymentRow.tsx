'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { todayIso } from '@/lib/crm-dates'
import { formatInr } from '@/lib/format-currency'
import { maintenanceRemainingDue } from '@/lib/maintenance-ledger-calc'
import { maintenanceGstBreakdown } from '@/lib/maintenance-gst'
import type { MaintenancePeriodLedger } from '@/types/crm-maintenance-record'

export default function MaintenancePaymentRow({
  ledger,
  saving,
  onSave,
}: {
  ledger: MaintenancePeriodLedger
  saving: boolean
  onSave: (paidAmount: number, paidOn: string, note: string) => Promise<void>
}) {
  const [paidInput, setPaidInput] = useState(String(ledger.paidAmount || ''))
  const [paidOn, setPaidOn] = useState(() => todayIso())

  useEffect(() => {
    setPaidInput(String(ledger.paidAmount || ''))
    if (ledger.status === 'unpaid' && ledger.paidAmount <= 0) {
      setPaidOn(todayIso())
    }
  }, [ledger.paidAmount, ledger.periodKey, ledger.projectId, ledger.status])

  async function markFullPaid() {
    await onSave(ledger.amountDue, todayIso(), '')
  }

  const dueNow = maintenanceRemainingDue(ledger)
  const isPaid = ledger.status === 'paid'
  const dueGst = maintenanceGstBreakdown(dueNow)
  const paidGst = maintenanceGstBreakdown(ledger.paidAmount)

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
        <div>
          <p className="uppercase tracking-wider text-platinum-600">This month (ex-GST)</p>
          <p className="crm-stat-sm mt-0.5">{formatInr(ledger.monthlyFee)}</p>
          <p className="mt-0.5 text-[9px] text-violet-200/75">Incl. 18% · {formatInr(maintenanceGstBreakdown(ledger.monthlyFee).totalInclGst)}</p>
        </div>
        <div>
          <p className="uppercase tracking-wider text-platinum-600">Carried forward</p>
          <p className={`crm-stat-sm mt-0.5 ${ledger.carryIn > 0 ? 'text-amber-200' : ''}`}>
            {formatInr(ledger.carryIn)}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wider text-platinum-600">Due (incl. 18% IGST)</p>
          <p className={`crm-stat-sm mt-0.5 ${isPaid ? 'text-emerald-200' : 'text-platinum-100'}`}>
            {formatInr(isPaid ? 0 : dueGst.totalInclGst)}
          </p>
          {!isPaid ? (
            <p className="mt-0.5 text-[9px] text-platinum-600">
              {formatInr(dueNow)} + IGST {formatInr(dueGst.gstAmount)} · Billed ex-GST {formatInr(ledger.amountDue)}
            </p>
          ) : (
            <p className="mt-0.5 text-[9px] uppercase tracking-wider text-emerald-300/70">Cleared</p>
          )}
        </div>
        <div>
          <p className="uppercase tracking-wider text-platinum-600">Received (incl. IGST)</p>
          <p
            className={`crm-stat-sm mt-0.5 ${
              ledger.paidAmount > 0 ? 'text-emerald-200/90' : 'text-platinum-400'
            }`}
          >
            {formatInr(paidGst.totalInclGst)}
          </p>
          {ledger.paidAmount > 0 ? (
            <p className="mt-0.5 text-[9px] text-platinum-600">Ex-GST {formatInr(ledger.paidAmount)}</p>
          ) : null}
        </div>
      </div>

      {ledger.carryIn > 0 && ledger.carryFromPeriods.length > 0 && (
        <p className="text-[11px] text-amber-200/80">
          Includes unpaid balance rolled from: {ledger.carryFromPeriods.join(', ')}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="crm-label">Recorded payment (₹)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            className="crm-input tabular-nums"
            value={paidInput}
            onChange={(e) => setPaidInput(e.target.value)}
          />
        </div>
        <div className="sm:w-40">
          <label className="crm-label">Paid on</label>
          <input type="date" className="crm-input tabular-nums" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave(Number(paidInput) || 0, paidOn || todayIso(), '')}
          className="crm-primary-btn shrink-0 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save payment'}
        </button>
        {ledger.balance > 0 && (
          <button
            type="button"
            disabled={saving}
            onClick={markFullPaid}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-xs uppercase tracking-wider text-emerald-100 hover:bg-emerald-500/25 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Mark paid
          </button>
        )}
      </div>

      {dueNow > 0 ? (
        <p className="text-[10px] text-platinum-600">
          Unpaid balance ({formatInr(dueNow)}) rolls into the next month automatically.
        </p>
      ) : isPaid ? (
        <p className="text-[10px] text-emerald-300/75">This month is fully paid — nothing due.</p>
      ) : null}
    </div>
  )
}
