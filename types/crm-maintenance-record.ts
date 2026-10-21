export interface CrmMaintenancePaymentRecord {
  id: string
  projectId: string
  /** Billing month YYYY-MM */
  periodKey: string
  paidAmount: number
  /** YYYY-MM-DD when fully or partially received */
  paidOn: string
  note: string
  updatedAt: string
}

export type MaintenancePaymentStatus = 'paid' | 'partial' | 'unpaid'

export interface MaintenancePeriodLedger {
  periodKey: string
  projectId: string
  monthlyFee: number
  carryIn: number
  amountDue: number
  paidAmount: number
  balance: number
  status: MaintenancePaymentStatus
  /** Prior months with unpaid balance rolled into this period */
  carryFromPeriods: string[]
  recordId: string | null
}

export interface MaintenanceProjectHistoryEntry {
  periodKey: string
  monthlyFee: number
  carryIn: number
  amountDue: number
  paidAmount: number
  balance: number
  status: MaintenancePaymentStatus
  paidOn: string
  note: string
}

export interface MaintenanceProjectHistory {
  projectId: string
  projectName: string
  clientName: string
  monthlyFee: number
  totalCollected: number
  totalBilled: number
  monthsTracked: number
  monthsPaid: number
  monthsPartial: number
  monthsUnpaid: number
  currentOutstanding: number
  entries: MaintenanceProjectHistoryEntry[]
}
