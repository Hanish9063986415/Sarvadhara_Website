export type CrmProjectStatus = 'active' | 'completed' | 'on_hold'

export type CrmProjectPhase =
  | 'discovery'
  | 'design'
  | 'development'
  | 'qa'
  | 'launch'
  | 'support'

export const CRM_PROJECT_PHASES: { id: CrmProjectPhase; label: string }[] = [
  { id: 'discovery', label: 'Discovery' },
  { id: 'design', label: 'Design' },
  { id: 'development', label: 'Development' },
  { id: 'qa', label: 'QA & UAT' },
  { id: 'launch', label: 'Launch' },
  { id: 'support', label: 'Support' },
]

export function phaseLabel(phase: CrmProjectPhase): string {
  return CRM_PROJECT_PHASES.find((p) => p.id === phase)?.label ?? 'Discovery'
}

export function normalizeDeliveryPhase(value: unknown): CrmProjectPhase {
  const phases: CrmProjectPhase[] = ['discovery', 'design', 'development', 'qa', 'launch', 'support']
  if (typeof value === 'string' && phases.includes(value as CrmProjectPhase)) {
    return value as CrmProjectPhase
  }
  return 'discovery'
}

export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function taskMeterAverage(tasks: CrmTask[]): number {
  if (tasks.length === 0) return 0
  const total = tasks.reduce((sum, task) => sum + clampProgress(task.meter), 0)
  return Math.round(total / tasks.length)
}

export function clampBillingDay(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.min(28, Math.max(1, Math.round(value)))
}

export interface CrmTask {
  id: string
  title: string
  description: string
  meter: number
}

export interface CrmPaymentTransaction {
  id: string
  label: string
  amount: number
  paidOn: string
  note: string
}

export interface CrmProjectDocument {
  id: string
  /** Display title, e.g. Signed proposal */
  label: string
  fileName: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
}

export interface CrmProject {
  id: string
  projectName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  projectUrl: string
  totalContractAmount: number
  /** Sum of the first transaction row — kept for quick display */
  firstTransactionAmount: number
  paymentsClearedAmount: number
  transactions: CrmPaymentTransaction[]
  balance: number
  allPaymentsCleared: boolean
  status: CrmProjectStatus
  notes: string
  tasks: CrmTask[]
  progressPercent: number
  deliveryPhase: CrmProjectPhase
  maintenanceEnabled: boolean
  maintenanceMonthlyAmount: number
  maintenanceBillingDay: number
  documents: CrmProjectDocument[]
  createdAt: string
  updatedAt: string
}

export type CrmProjectInput = Omit<
  CrmProject,
  'id' | 'balance' | 'allPaymentsCleared' | 'createdAt' | 'updatedAt' | 'documents'
>

export function sumTransactionAmounts(transactions: CrmPaymentTransaction[]): number {
  return transactions.reduce((sum, txn) => sum + Math.max(0, txn.amount), 0)
}

export function financialsFromTransactions(
  totalContractAmount: number,
  transactions: CrmPaymentTransaction[]
) {
  const paymentsClearedAmount = sumTransactionAmounts(transactions)
  const financials = computeProjectFinancials({ totalContractAmount, paymentsClearedAmount })
  const firstTransactionAmount = transactions.length > 0 ? Math.max(0, transactions[0].amount) : 0
  return { ...financials, firstTransactionAmount }
}

export function computeProjectFinancials(input: {
  totalContractAmount: number
  paymentsClearedAmount: number
}) {
  const total = Math.max(0, input.totalContractAmount)
  const cleared = Math.max(0, Math.min(input.paymentsClearedAmount, total))
  const balance = Math.max(0, total - cleared)
  return {
    paymentsClearedAmount: cleared,
    balance,
    allPaymentsCleared: total > 0 && balance === 0,
  }
}

export function defaultCrmProjectFields(): Pick<
  CrmProjectInput,
  | 'progressPercent'
  | 'deliveryPhase'
  | 'maintenanceEnabled'
  | 'maintenanceMonthlyAmount'
  | 'maintenanceBillingDay'
> {
  return {
    progressPercent: 0,
    deliveryPhase: 'discovery',
    maintenanceEnabled: false,
    maintenanceMonthlyAmount: 0,
    maintenanceBillingDay: 1,
  }
}
