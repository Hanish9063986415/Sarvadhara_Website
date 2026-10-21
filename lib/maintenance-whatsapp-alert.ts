import { formatInr } from '@/lib/format-currency'
import { maintenanceGstBreakdown } from '@/lib/maintenance-gst'
import { formatCrmDate, todayIso } from '@/lib/crm-dates'
import { SARVADHARA_INVOICE_FROM } from '@/lib/sarvadhara-invoice-from'
import type { MaintenancePeriodLedger } from '@/types/crm-maintenance-record'
import type { CrmProject } from '@/types/crm-project'

export function buildMaintenancePaymentWhatsAppMessage(input: {
  project: CrmProject
  monthLabel: string
  ledger: MaintenancePeriodLedger | undefined
  invoiceUrl: string
  paidOnIso?: string
}): string {
  const { project, monthLabel, ledger, invoiceUrl } = input
  const client = project.clientName.trim() || 'there'
  const paid = ledger?.paidAmount ?? 0
  const paidIncl = maintenanceGstBreakdown(paid)
  const status = ledger?.status ?? 'unpaid'
  const paidOn = input.paidOnIso && /^\d{4}-\d{2}-\d{2}$/.test(input.paidOnIso)
    ? formatCrmDate(input.paidOnIso)
    : formatCrmDate(todayIso())

  const statusLine =
    status === 'paid'
      ? 'Status: Paid in full for this month.'
      : status === 'partial'
        ? `Status: Partial payment received (balance ${formatInr(ledger?.balance ?? 0)}).`
        : `Status: Payment recorded — ${formatInr(paid)} received.`

  return (
    `Hello ${client},\n\n` +
    `Greetings from *${SARVADHARA_INVOICE_FROM.displayName}*.\n\n` +
    `We have updated your *website maintenance* account for *${monthLabel}* (*${project.projectName}*).\n\n` +
    `*Amount received (ex-GST):* ${formatInr(paid)}\n` +
    `*Incl. 18% IGST:* ${formatInr(paidIncl.totalInclGst)} (IGST ${formatInr(paidIncl.gstAmount)})\n` +
    `*Date:* ${paidOn}\n` +
    `${statusLine}\n\n` +
    `*Tax invoice (view / save PDF):*\n${invoiceUrl}\n\n` +
    `Open the link → Print → Save as PDF if you need a copy. You can also attach the PDF in this chat.\n\n` +
    `Thank you for your continued trust.\n\n` +
    `— ${SARVADHARA_INVOICE_FROM.legalName}\n` +
    `${SARVADHARA_INVOICE_FROM.phone}\n` +
    `${SARVADHARA_INVOICE_FROM.email}`
  )
}
