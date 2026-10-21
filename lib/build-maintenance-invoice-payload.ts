import { billingDateForMonth, formatMonthLabel } from '@/lib/maintenance-schedule'
import {
  invoiceTotals,
  suggestMaintenanceInvoiceNumber,
  type MaintenanceInvoiceLine,
} from '@/lib/maintenance-invoice-math'
import { isoFromLocalDate, todayIso } from '@/lib/crm-dates'
import { SARVADHARA_INVOICE_FROM } from '@/lib/sarvadhara-invoice-from'
import type { MaintenanceInvoicePrintProps } from '@/types/maintenance-invoice-print'
import type { MaintenancePeriodLedger } from '@/types/crm-maintenance-record'
import type { CrmProject } from '@/types/crm-project'

const DEFAULT_GST = 18

function defaultServiceName(project: CrmProject, servicePeriodLabel: string): string {
  const subject = project.clientName.trim() || project.projectName.trim()
  return `${subject} Website Maintenance — ${servicePeriodLabel}`
}

export function buildMaintenanceInvoicePayload(input: {
  project: CrmProject
  year: number
  monthIndex: number
  ledger: MaintenancePeriodLedger | undefined
  projectIndex: number
  clearanceDueDateIso?: string
  gstPercent?: number
}): MaintenanceInvoicePrintProps {
  const { project, year, monthIndex, ledger, projectIndex, clearanceDueDateIso } = input
  const gstPercent = input.gstPercent ?? DEFAULT_GST
  const servicePeriodLabel = formatMonthLabel(year, monthIndex)
  const invoiceNumber = suggestMaintenanceInvoiceNumber(projectIndex)
  const invoiceDate = todayIso()

  let dueDate = invoiceDate
  if (clearanceDueDateIso && /^\d{4}-\d{2}-\d{2}$/.test(clearanceDueDateIso)) {
    dueDate = clearanceDueDateIso
  } else {
    dueDate = isoFromLocalDate(billingDateForMonth(year, monthIndex, project.maintenanceBillingDay))
  }

  const billBase =
    ledger && ledger.paidAmount > 0
      ? ledger.paidAmount
      : ledger?.amountDue ?? project.maintenanceMonthlyAmount

  const lines: MaintenanceInvoiceLine[] = [
    {
      id: 'maintenance-line',
      description: defaultServiceName(project, servicePeriodLabel),
      quantity: 1,
      unitPrice: billBase,
    },
  ]

  const totals = invoiceTotals(lines, gstPercent)

  return {
    invoiceNumber,
    invoiceDate,
    dueDate,
    servicePeriodLabel,
    gstPercent: totals.gstPercent,
    subtotal: totals.subtotal,
    gstAmount: totals.gstAmount,
    grandTotal: totals.grandTotal,
    lines,
    issuerGstin: SARVADHARA_INVOICE_FROM.gstin,
    clientName: project.clientName ?? '',
    clientAddress: project.clientAddress ?? '',
    clientEmail: project.clientEmail ?? '',
    clientPhone: project.clientPhone ?? '',
    notes:
      ledger && ledger.paidAmount > 0
        ? `Payment recorded for ${servicePeriodLabel}. Amount received: ₹${billBase.toFixed(2)}.`
        : '',
  }
}
