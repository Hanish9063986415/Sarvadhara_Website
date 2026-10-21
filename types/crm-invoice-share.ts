import type { MaintenanceInvoicePrintProps } from '@/types/maintenance-invoice-print'

export type CrmMaintenanceInvoiceShare = {
  id: string
  projectId: string
  periodKey: string
  createdAt: string
  invoiceNumber: string
  props: MaintenanceInvoicePrintProps
}
