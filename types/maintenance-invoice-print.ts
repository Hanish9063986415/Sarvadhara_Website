import type { MaintenanceInvoiceLine } from '@/lib/maintenance-invoice-math'

export type MaintenanceInvoicePrintProps = {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  servicePeriodLabel: string
  gstPercent: number
  subtotal: number
  gstAmount: number
  grandTotal: number
  lines: MaintenanceInvoiceLine[]
  issuerGstin: string
  clientName: string
  clientAddress: string
  clientEmail: string
  clientPhone: string
  notes: string
}
