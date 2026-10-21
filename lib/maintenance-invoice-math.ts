import { formatCrmDate } from '@/lib/crm-dates'

export type MaintenanceInvoiceLine = {
  id: string
  description: string
  quantity: number
  unitPrice: number
  /** Per-line GST %; falls back to invoice-level GST when unset */
  gstPercent?: number
}

export function lineTaxableAmount(line: MaintenanceInvoiceLine): number {
  const qty = Math.max(0, Number(line.quantity) || 0)
  const rate = Math.max(0, Number(line.unitPrice) || 0)
  return Math.round(qty * rate * 100) / 100
}

export function lineGstPercent(line: MaintenanceInvoiceLine, invoiceGstPercent: number): number {
  const lineRate = line.gstPercent
  if (lineRate !== undefined && Number.isFinite(lineRate)) {
    return Math.max(0, Math.min(100, lineRate))
  }
  return Math.max(0, Math.min(100, Number(invoiceGstPercent) || 0))
}

export function lineGstAmount(line: MaintenanceInvoiceLine, invoiceGstPercent: number): number {
  const taxable = lineTaxableAmount(line)
  const pct = lineGstPercent(line, invoiceGstPercent)
  return Math.round(taxable * (pct / 100) * 100) / 100
}

export function lineTotalInclGst(line: MaintenanceInvoiceLine, invoiceGstPercent: number): number {
  const taxable = lineTaxableAmount(line)
  const gst = lineGstAmount(line, invoiceGstPercent)
  return Math.round((taxable + gst) * 100) / 100
}

/** @deprecated use lineTaxableAmount */
export function lineAmount(line: MaintenanceInvoiceLine): number {
  return lineTaxableAmount(line)
}

export function invoiceTotals(lines: MaintenanceInvoiceLine[], invoiceGstPercent: number) {
  let subtotal = 0
  let gstAmount = 0
  for (const line of lines) {
    subtotal += lineTaxableAmount(line)
    gstAmount += lineGstAmount(line, invoiceGstPercent)
  }
  subtotal = Math.round(subtotal * 100) / 100
  gstAmount = Math.round(gstAmount * 100) / 100
  const grandTotal = Math.round((subtotal + gstAmount) * 100) / 100
  const gstRate = Math.max(0, Math.min(100, Number(invoiceGstPercent) || 0))
  return { subtotal, gstPercent: gstRate, gstAmount, grandTotal }
}

/** Sample-style invoice numbers e.g. STI0011 */
export function suggestMaintenanceInvoiceNumber(projectIndex: number): string {
  return `STI${String(projectIndex + 1).padStart(4, '0')}`
}

/** Invoice print / CRM fields (en-IN, live calendar date). */
export function formatInvoiceDate(isoDate: string): string {
  return formatCrmDate(isoDate)
}

export function isoFromParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Parse typed dates: ISO, D/M/Y, D-M-Y, or natural language (e.g. 20 Oct 2026). */
export function parseFlexibleDateToIso(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T12:00:00`)
    return Number.isNaN(d.getTime()) ? null : trimmed
  }

  const dmy = trimmed.match(/^(\d{1,2})[./\s-](\d{1,2})[./\s-](\d{4})$/)
  if (dmy) {
    const day = Number(dmy[1])
    const month = Number(dmy[2])
    const year = Number(dmy[3])
    if (year >= 2000 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const iso = isoFromParts(year, month, day)
      const check = new Date(`${iso}T12:00:00`)
      if (check.getFullYear() === year && check.getMonth() === month - 1 && check.getDate() === day) {
        return iso
      }
    }
  }

  const parsed = Date.parse(trimmed)
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed)
    return isoFromParts(d.getFullYear(), d.getMonth() + 1, d.getDate())
  }
  return null
}

export function formatBillPhone(phone: string): string {
  const trimmed = phone.trim()
  if (!trimmed) return ''
  if (/^phone:/i.test(trimmed)) return trimmed
  return `Phone: ${trimmed}`
}
