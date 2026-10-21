import { formatInr } from '@/lib/format-currency'
import { maintenanceGstBreakdown } from '@/lib/maintenance-gst'
import { maintenanceRemainingDue } from '@/lib/maintenance-ledger-calc'
import { billingDateForMonth, formatMonthLabel } from '@/lib/maintenance-schedule'
import { formatCrmDate, todayIso } from '@/lib/crm-dates'
import { SARVADHARA_INVOICE_FROM } from '@/lib/sarvadhara-invoice-from'
import type { MaintenancePeriodLedger } from '@/types/crm-maintenance-record'
import type { CrmProject } from '@/types/crm-project'

export type MaintenanceWhatsAppTemplateId =
  | 'monthly_renewal'
  | 'payment_due'
  | 'payment_received'
  | 'paid_in_full'
  | 'custom'

export const MAINTENANCE_WHATSAPP_TEMPLATES: {
  id: MaintenanceWhatsAppTemplateId
  label: string
  description: string
  accent: 'emerald' | 'amber' | 'violet' | 'sky'
}[] = [
  {
    id: 'monthly_renewal',
    label: 'Renewal this month',
    description: 'Friendly retainer reminder for the billing month',
    accent: 'sky',
  },
  {
    id: 'payment_due',
    label: 'Payment due',
    description: 'Outstanding balance and clearance deadline',
    accent: 'amber',
  },
  {
    id: 'payment_received',
    label: 'Payment received',
    description: 'Acknowledge amount recorded for this month',
    accent: 'emerald',
  },
  {
    id: 'paid_in_full',
    label: 'Paid in full',
    description: 'Thank-you when the month is cleared',
    accent: 'violet',
  },
  {
    id: 'custom',
    label: 'Custom message',
    description: 'Write your own text and send',
    accent: 'emerald',
  },
]

export type MaintenanceWhatsAppTemplateContext = {
  project: CrmProject
  year: number
  monthIndex: number
  ledger: MaintenancePeriodLedger | undefined
  clearanceLabel: string
  invoiceUrl?: string
  paidOnIso?: string
}

function greeting(project: CrmProject): string {
  const client = project.clientName.trim() || 'there'
  return (
    `Hello ${client},\n\n` + `Greetings from *${SARVADHARA_INVOICE_FROM.displayName}*.\n\n`
  )
}

function signatureBlock(): string {
  return (
    `\n\nThank you for your continued trust.\n\n` +
    `— ${SARVADHARA_INVOICE_FROM.legalName}\n` +
    `${SARVADHARA_INVOICE_FROM.phone}\n` +
    `${SARVADHARA_INVOICE_FROM.email}`
  )
}

function retainerLines(project: CrmProject, ledger: MaintenancePeriodLedger | undefined): string {
  const taxable = ledger?.monthlyFee ?? project.maintenanceMonthlyAmount
  const gst = maintenanceGstBreakdown(taxable)
  return (
    `*Monthly retainer (ex-GST):* ${formatInr(taxable)}\n` +
    `*Incl. 18% IGST:* ${formatInr(gst.totalInclGst)} (IGST ${formatInr(gst.gstAmount)})\n`
  )
}

export function buildMaintenanceWhatsAppTemplate(
  templateId: MaintenanceWhatsAppTemplateId,
  ctx: MaintenanceWhatsAppTemplateContext,
  customBody?: string
): string {
  const { project, year, monthIndex, ledger, clearanceLabel, invoiceUrl } = ctx
  const monthLabel = formatMonthLabel(year, monthIndex)
  const dueExGst = maintenanceRemainingDue(ledger, project.maintenanceMonthlyAmount)
  const dueGst = maintenanceGstBreakdown(dueExGst)
  const paid = ledger?.paidAmount ?? 0
  const paidGst = maintenanceGstBreakdown(paid)
  const billingDate = billingDateForMonth(year, monthIndex, project.maintenanceBillingDay)
  const billingLabel = formatCrmDate(
    `${billingDate.getFullYear()}-${String(billingDate.getMonth() + 1).padStart(2, '0')}-${String(billingDate.getDate()).padStart(2, '0')}`
  )

  if (templateId === 'custom') {
    const body = (customBody ?? '').trim()
    if (!body) {
      return (
        greeting(project) +
        `*${project.projectName}* — maintenance update for *${monthLabel}*.\n\n` +
        `[Your message here]` +
        signatureBlock()
      )
    }
    return body.includes(SARVADHARA_INVOICE_FROM.legalName) ? body : body + signatureBlock()
  }

  if (templateId === 'monthly_renewal') {
    return (
      greeting(project) +
      `This is a reminder for your *website maintenance* retainer for *${monthLabel}* (*${project.projectName}*).\n\n` +
      retainerLines(project, ledger) +
      `*Billing date:* ${billingLabel} (day ${project.maintenanceBillingDay})\n` +
      `*Please clear by:* ${clearanceLabel}\n\n` +
      `If you have already paid for this month, please ignore this message. For invoice or payment details, reply here.\n` +
      signatureBlock()
    )
  }

  if (templateId === 'payment_due') {
    const carry = ledger?.carryIn ?? 0
    const carryLine =
      carry > 0 ? `*Includes carry-forward (ex-GST):* ${formatInr(carry)}\n` : ''
    return (
      greeting(project) +
      `Your maintenance account for *${monthLabel}* (*${project.projectName}*) has an outstanding balance.\n\n` +
      retainerLines(project, ledger) +
      carryLine +
      `*Due now (ex-GST):* ${formatInr(dueExGst)}\n` +
      `*Due incl. 18% IGST:* ${formatInr(dueGst.totalInclGst)}\n` +
      `*Clear by:* ${clearanceLabel}\n\n` +
      `Please complete payment at your earliest convenience. Reply on WhatsApp if you need our UPI / bank details or a tax invoice.\n` +
      signatureBlock()
    )
  }

  if (templateId === 'payment_received') {
    const paidOn = ctx.paidOnIso && /^\d{4}-\d{2}-\d{2}$/.test(ctx.paidOnIso) ? ctx.paidOnIso : todayIso()
    const paidOnLabel = formatCrmDate(paidOn)
    const invoiceBlock = invoiceUrl?.trim()
      ? `\n*Tax invoice (view / save PDF):*\n${invoiceUrl.trim()}\n`
      : ''
    return (
      greeting(project) +
      `We have recorded your *maintenance payment* for *${monthLabel}* (*${project.projectName}*).\n\n` +
      `*Amount received (ex-GST):* ${formatInr(paid)}\n` +
      `*Incl. 18% IGST:* ${formatInr(paidGst.totalInclGst)} (IGST ${formatInr(paidGst.gstAmount)})\n` +
      `*Date:* ${paidOnLabel}\n` +
      invoiceBlock +
      `\nThank you — your support keeps your site secure and up to date.\n` +
      signatureBlock()
    )
  }

  // paid_in_full
  return (
    greeting(project) +
    `Thank you — your maintenance for *${monthLabel}* (*${project.projectName}*) is *paid in full*.\n\n` +
    `*Amount cleared (ex-GST):* ${formatInr(ledger?.amountDue ?? project.maintenanceMonthlyAmount)}\n` +
    `*Status:* No balance remaining for this month.\n\n` +
    `We appreciate your prompt payment. Reach out anytime you need changes or support on your site.\n` +
    signatureBlock()
  )
}

/** Suggest a template from ledger status when the user picks a project. */
export function suggestMaintenanceWhatsAppTemplate(
  ledger: MaintenancePeriodLedger | undefined
): MaintenanceWhatsAppTemplateId {
  const status = ledger?.status ?? 'unpaid'
  if (status === 'paid') return 'paid_in_full'
  if (status === 'partial' || (ledger?.paidAmount ?? 0) > 0) return 'payment_received'
  if ((ledger?.balance ?? 1) > 0) return 'payment_due'
  return 'monthly_renewal'
}
