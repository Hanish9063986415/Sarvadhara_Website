/** Default IGST on maintenance invoices (matches invoice builder). */
export const MAINTENANCE_GST_PERCENT = 18

export type MaintenanceGstBreakdown = {
  taxable: number
  gstPercent: number
  gstAmount: number
  totalInclGst: number
}

export function maintenanceGstBreakdown(
  taxable: number,
  gstPercent: number = MAINTENANCE_GST_PERCENT
): MaintenanceGstBreakdown {
  const base = Math.max(0, taxable)
  const rate = Math.max(0, Math.min(100, gstPercent))
  const gstAmount = Math.round(base * (rate / 100) * 100) / 100
  const totalInclGst = Math.round((base + gstAmount) * 100) / 100
  return { taxable: base, gstPercent: rate, gstAmount, totalInclGst }
}
