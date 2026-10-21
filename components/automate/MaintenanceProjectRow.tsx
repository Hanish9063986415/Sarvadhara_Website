'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { projectRecordPath } from '@/lib/automate-routes'
import { formatInr } from '@/lib/format-currency'
import { MaintenanceTaxableWithGst } from '@/components/automate/MaintenanceGstLines'
import { maintenanceDisplayCarryIn, maintenanceRemainingDue } from '@/lib/maintenance-ledger-calc'
import { maintenanceGstBreakdown } from '@/lib/maintenance-gst'
import MaintenancePaymentRow from '@/components/automate/MaintenancePaymentRow'
import MaintenanceProjectActionsMenu from '@/components/automate/MaintenanceProjectActionsMenu'
import MaintenanceWhatsAppAlertButton from '@/components/automate/MaintenanceWhatsAppAlertButton'
import type { MaintenancePeriodLedger } from '@/types/crm-maintenance-record'
import type { CrmProject } from '@/types/crm-project'

export default function MaintenanceProjectRow({
  project,
  dueDate,
  clearanceLabel,
  pastClearance,
  ledger,
  invoiceOpen,
  historyDetailHref,
  periodKey,
  billingYear,
  billingMonthIndex,
  clearanceDueDateIso,
  paymentSaving,
  onToggleInvoice,
  onSavePayment,
  onSetPaidStatus,
  monthLabel,
  canDeleteProject,
  manageBusy,
  onClearMonthPayment,
  onRemoveFromBilling,
  onErasePaymentHistory,
  onDeleteProject,
}: {
  project: CrmProject
  dueDate: Date
  clearanceLabel: string
  pastClearance: boolean
  ledger: MaintenancePeriodLedger | undefined
  invoiceOpen: boolean
  historyDetailHref: string
  periodKey: string
  billingYear: number
  billingMonthIndex: number
  clearanceDueDateIso?: string
  paymentSaving: boolean
  onToggleInvoice: () => void
  onSavePayment: (paidAmount: number, paidOn: string, note: string) => Promise<void>
  onSetPaidStatus: (paid: boolean) => Promise<void>
  monthLabel: string
  canDeleteProject: boolean
  manageBusy: boolean
  onClearMonthPayment: () => Promise<void>
  onRemoveFromBilling: () => Promise<void>
  onErasePaymentHistory: () => Promise<void>
  onDeleteProject: () => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const status = ledger?.status ?? 'unpaid'
  const isPaid = status === 'paid'
  const isPartial = status === 'partial'
  const dueNow = maintenanceRemainingDue(ledger, project.maintenanceMonthlyAmount)
  const carryDisplay = maintenanceDisplayCarryIn(ledger)
  const retainerTaxable = ledger?.monthlyFee ?? project.maintenanceMonthlyAmount
  const dueInclGst = maintenanceGstBreakdown(dueNow).totalInclGst

  return (
    <li
      className={`relative overflow-visible border-b border-white/[0.06] last:border-0 transition-colors ${
        invoiceOpen ? 'bg-violet-500/[0.06]' : 'hover:bg-white/[0.02]'
      }`}
    >
      <div className="flex flex-col gap-4 px-4 py-4 sm:grid sm:grid-cols-[minmax(0,1fr)_repeat(4,minmax(72px,auto))_auto] sm:items-center sm:gap-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_repeat(4,minmax(72px,auto))_minmax(140px,auto)_auto]">
        <div className="flex min-w-0 items-center gap-3 sm:col-span-1">
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10">
            <span className="text-[9px] uppercase text-platinum-500">{dueDate.toLocaleString('en-IN', { month: 'short' })}</span>
            <span className="crm-stat text-base text-platinum-200">{dueDate.getDate()}</span>
          </div>
          <div className="min-w-0">
            <Link href={projectRecordPath(project.id)} className="truncate font-medium text-platinum-200 hover:text-platinum-metallic">
              {project.projectName}
            </Link>
            <p className="truncate text-xs text-platinum-500">
              {project.clientName || 'Client TBD'}
              {project.clientPhone?.trim() ? (
                <span className="text-platinum-600"> · {project.clientPhone.trim()}</span>
              ) : null}
            </p>
            <p className={`mt-0.5 text-[10px] ${pastClearance && !isPaid ? 'text-red-300/90' : 'text-platinum-600'}`}>
              Clear by {clearanceLabel}
              {pastClearance && !isPaid ? ' · overdue' : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.06] bg-black/20 p-3 sm:hidden">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-platinum-600">Retainer (ex-GST)</p>
            <MaintenanceTaxableWithGst taxable={retainerTaxable} primaryClassName="crm-stat-sm" />
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-platinum-600">Carry</p>
            {carryDisplay > 0 ? (
              <MaintenanceTaxableWithGst taxable={carryDisplay} primaryClassName="crm-stat-sm text-amber-200" />
            ) : (
              <p className="crm-stat-sm text-platinum-600">{formatInr(0)}</p>
            )}
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-platinum-600">Due (incl. GST)</p>
            {isPaid || dueNow <= 0 ? (
              <p className="crm-stat-sm text-emerald-200">{formatInr(0)}</p>
            ) : (
              <MaintenanceTaxableWithGst
                taxable={dueNow}
                emphasizeTotalWhenDue
                primaryClassName={`crm-stat-sm ${isPartial ? 'text-amber-100' : 'text-platinum-100'}`}
              />
            )}
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-platinum-600">Balance</p>
            <p
              className={`crm-stat-sm ${
                dueNow > 0 ? 'text-red-200/90' : isPaid ? 'text-emerald-200' : 'text-platinum-300'
              }`}
            >
              {formatInr(dueNow > 0 ? dueInclGst : 0)}
            </p>
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <p className="text-[9px] uppercase tracking-wider text-platinum-600">Retainer (ex-GST)</p>
          <MaintenanceTaxableWithGst taxable={retainerTaxable} />
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-[9px] uppercase tracking-wider text-platinum-600">Carry (ex-GST)</p>
          {carryDisplay > 0 ? (
            <MaintenanceTaxableWithGst taxable={carryDisplay} primaryClassName="crm-stat-sm text-amber-200" />
          ) : (
            <p className={`crm-stat-sm ${isPaid ? 'text-platinum-600' : ''}`}>{formatInr(0)}</p>
          )}
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-[9px] uppercase tracking-wider text-platinum-600">
            {isPaid ? 'Due (incl. GST)' : 'Due now (incl. 18%)'}
          </p>
          {isPaid || dueNow <= 0 ? (
            <>
              <p className="crm-stat-sm text-emerald-200">{formatInr(0)}</p>
              {isPaid && ledger ? (
                <p className="mt-0.5 text-[9px] uppercase tracking-wider text-emerald-300/70">Cleared</p>
              ) : null}
            </>
          ) : (
            <MaintenanceTaxableWithGst
              taxable={dueNow}
              emphasizeTotalWhenDue
              primaryClassName={`crm-stat-sm ${isPartial ? 'text-amber-100' : 'text-platinum-100'}`}
            />
          )}
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-[9px] uppercase tracking-wider text-platinum-600">Balance (incl. GST)</p>
          <p
            className={`crm-stat-sm ${
              dueNow > 0 ? 'text-red-200/90' : isPaid ? 'text-emerald-200' : 'text-platinum-300'
            }`}
          >
            {formatInr(dueNow > 0 ? dueInclGst : 0)}
          </p>
          {dueNow > 0 ? (
            <p className="mt-0.5 text-[9px] text-platinum-600">Ex-GST {formatInr(dueNow)}</p>
          ) : null}
        </div>

        <div className="hidden lg:flex lg:justify-center">
          <div className="inline-flex rounded-xl border border-white/10 bg-black/30 p-0.5">
            <button
              type="button"
              disabled={paymentSaving}
              onClick={() => onSetPaidStatus(true)}
              className={`rounded-lg px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${
                isPaid ? 'bg-emerald-500/25 text-emerald-100' : 'text-platinum-500 hover:text-platinum-300'
              }`}
            >
              {paymentSaving ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : 'Paid'}
            </button>
            <button
              type="button"
              disabled={paymentSaving}
              onClick={() => onSetPaidStatus(false)}
              className={`rounded-lg px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${
                !isPaid && status !== 'partial'
                  ? 'bg-red-500/20 text-red-100'
                  : status === 'partial'
                    ? 'bg-amber-500/15 text-amber-100'
                    : 'text-platinum-500 hover:text-platinum-300'
              }`}
            >
              Unpaid
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col sm:items-end sm:justify-end">
          <Link
            href={historyDetailHref}
            className="col-span-2 flex min-h-[44px] items-center justify-center rounded-lg border border-amber-400/35 bg-amber-500/[0.08] px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-amber-100 shadow-sm transition-colors hover:border-amber-300/45 hover:bg-amber-500/15 sm:col-span-1 sm:inline-flex sm:min-h-0 sm:py-1.5"
          >
            View details
          </Link>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-lg border border-white/10 px-2.5 py-2 text-[10px] uppercase tracking-wider text-platinum-400 hover:text-platinum-metallic sm:min-h-0 sm:py-1.5"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Amount
          </button>
          <button
            type="button"
            onClick={onToggleInvoice}
            className={`rounded-lg border px-2.5 py-1.5 text-[10px] uppercase tracking-wider ${
              invoiceOpen
                ? 'border-violet-300/40 bg-violet-500/25 text-violet-100'
                : 'border-violet-400/25 text-violet-200/90 hover:bg-violet-500/10'
            }`}
          >
            {invoiceOpen ? 'Close bill' : 'Invoice'}
          </button>
          <MaintenanceWhatsAppAlertButton
            project={project}
            periodKey={periodKey}
            year={billingYear}
            monthIndex={billingMonthIndex}
            ledger={ledger}
            clearanceDueDateIso={clearanceDueDateIso}
            compact
          />
          <MaintenanceProjectActionsMenu
            project={project}
            monthLabel={monthLabel}
            ledger={ledger}
            canDeleteProject={canDeleteProject}
            busy={manageBusy}
            onClearMonth={onClearMonthPayment}
            onLeaveBilling={onRemoveFromBilling}
            onEraseHistory={onErasePaymentHistory}
            onDeleteProject={onDeleteProject}
          />
        </div>
      </div>

      <div className="flex gap-2 px-4 pb-3 lg:hidden sm:px-6">
        <div className="inline-flex flex-1 rounded-xl border border-white/10 bg-black/30 p-0.5">
          <button
            type="button"
            disabled={paymentSaving}
            onClick={() => onSetPaidStatus(true)}
            className={`flex-1 rounded-lg py-2 text-[10px] uppercase tracking-wider ${
              isPaid ? 'bg-emerald-500/25 text-emerald-100' : 'text-platinum-500'
            }`}
          >
            Paid
          </button>
          <button
            type="button"
            disabled={paymentSaving}
            onClick={() => onSetPaidStatus(false)}
            className={`flex-1 rounded-lg py-2 text-[10px] uppercase tracking-wider ${
              !isPaid ? 'bg-red-500/20 text-red-100' : 'text-platinum-500'
            }`}
          >
            Unpaid
          </button>
        </div>
      </div>

      {expanded && ledger && (
        <div className="px-4 pb-4 sm:px-6">
          <MaintenancePaymentRow ledger={ledger} saving={paymentSaving} onSave={onSavePayment} />
        </div>
      )}
    </li>
  )
}
