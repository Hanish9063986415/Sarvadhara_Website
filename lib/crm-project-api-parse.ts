import type {
  CrmPaymentTransaction,
  CrmProjectDocument,
  CrmProjectInput,
  CrmProjectPhase,
  CrmProjectStatus,
  CrmTask,
} from '@/types/crm-project'
import {
  clampBillingDay,
  clampProgress,
  financialsFromTransactions,
  normalizeDeliveryPhase,
} from '@/types/crm-project'

export function parseTasks(value: unknown): CrmTask[] {
  if (!Array.isArray(value)) return []
  const tasks: CrmTask[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const task = item as Record<string, unknown>
    const title = typeof task.title === 'string' ? task.title.trim() : ''
    if (!title) continue
    const id = typeof task.id === 'string' && task.id.trim() ? task.id.trim() : crypto.randomUUID()
    tasks.push({
      id,
      title,
      description: typeof task.description === 'string' ? task.description : '',
      meter: clampProgress(Number(task.meter) || 0),
    })
    if (tasks.length >= 40) break
  }
  return tasks
}

export function parseDocuments(value: unknown): CrmProjectDocument[] {
  if (!Array.isArray(value)) return []
  const docs: CrmProjectDocument[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const d = item as Record<string, unknown>
    const label = typeof d.label === 'string' ? d.label.trim() : ''
    const fileName = typeof d.fileName === 'string' ? d.fileName.trim() : ''
    if (!label || !fileName) continue
    const id = typeof d.id === 'string' && d.id.trim() ? d.id.trim() : crypto.randomUUID()
    docs.push({
      id,
      label: label.slice(0, 120),
      fileName: fileName.slice(0, 255),
      mimeType: typeof d.mimeType === 'string' ? d.mimeType.slice(0, 120) : 'application/octet-stream',
      sizeBytes: Math.max(0, Math.min(Number(d.sizeBytes) || 0, 50_000_000)),
      uploadedAt: typeof d.uploadedAt === 'string' ? d.uploadedAt : new Date().toISOString(),
    })
    if (docs.length >= 30) break
  }
  return docs
}

export function parseTransactions(value: unknown): CrmPaymentTransaction[] {
  if (!Array.isArray(value)) return []
  const items: CrmPaymentTransaction[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const txn = item as Record<string, unknown>
    const label = typeof txn.label === 'string' ? txn.label.trim() : ''
    const amount = Math.max(0, Number(txn.amount) || 0)
    if (!label || amount <= 0) continue
    const id = typeof txn.id === 'string' && txn.id.trim() ? txn.id.trim() : crypto.randomUUID()
    const paidOn = typeof txn.paidOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(txn.paidOn) ? txn.paidOn : ''
    items.push({
      id,
      label,
      amount,
      paidOn,
      note: typeof txn.note === 'string' ? txn.note.slice(0, 500) : '',
    })
    if (items.length >= 50) break
  }
  return items
}

export function legacyTransactionsFromAmounts(first: number, cleared: number): CrmPaymentTransaction[] {
  const txns: CrmPaymentTransaction[] = []
  const firstAmt = Math.max(0, first)
  const clearedAmt = Math.max(0, cleared)
  if (firstAmt > 0) {
    txns.push({ id: 'legacy-first', label: 'First payment', amount: firstAmt, paidOn: '', note: '' })
  }
  const rest = clearedAmt - firstAmt
  if (rest > 0) {
    txns.push({ id: 'legacy-additional', label: 'Additional payment', amount: rest, paidOn: '', note: '' })
  } else if (clearedAmt > 0 && firstAmt === 0) {
    txns.push({ id: 'legacy-cleared', label: 'Payment received', amount: clearedAmt, paidOn: '', note: '' })
  }
  return txns
}

function withSyncedFinancials(
  partial: Omit<CrmProjectInput, 'paymentsClearedAmount' | 'firstTransactionAmount'> & {
    paymentsClearedAmount?: number
    firstTransactionAmount?: number
  }
): CrmProjectInput {
  const synced = financialsFromTransactions(partial.totalContractAmount, partial.transactions)
  return {
    ...partial,
    paymentsClearedAmount: synced.paymentsClearedAmount,
    firstTransactionAmount: synced.firstTransactionAmount,
  } as CrmProjectInput
}

export function parseCrmProjectBody(body: unknown): CrmProjectInput | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const status = b.status as CrmProjectStatus
  if (!['active', 'completed', 'on_hold'].includes(status)) return null
  if (typeof b.projectName !== 'string' || !b.projectName.trim()) return null

  let transactions = parseTransactions(b.transactions)
  if (transactions.length === 0) {
    transactions = legacyTransactionsFromAmounts(
      Number(b.firstTransactionAmount) || 0,
      Number(b.paymentsClearedAmount) || 0
    )
  }

  return withSyncedFinancials({
    projectName: b.projectName,
    clientName: typeof b.clientName === 'string' ? b.clientName : '',
    clientEmail: typeof b.clientEmail === 'string' ? b.clientEmail : '',
    clientPhone: typeof b.clientPhone === 'string' ? b.clientPhone.slice(0, 40) : '',
    clientAddress: typeof b.clientAddress === 'string' ? b.clientAddress.slice(0, 2000) : '',
    projectUrl: typeof b.projectUrl === 'string' ? b.projectUrl : '',
    totalContractAmount: Number(b.totalContractAmount) || 0,
    status,
    notes: typeof b.notes === 'string' ? b.notes.slice(0, 20000) : '',
    tasks: parseTasks(b.tasks),
    transactions,
    progressPercent: clampProgress(Number(b.progressPercent) || 0),
    deliveryPhase: normalizeDeliveryPhase(b.deliveryPhase),
    maintenanceEnabled: Boolean(b.maintenanceEnabled),
    maintenanceMonthlyAmount: Math.max(0, Number(b.maintenanceMonthlyAmount) || 0),
    maintenanceBillingDay: clampBillingDay(Number(b.maintenanceBillingDay) || 1),
  })
}

export function crmProjectToInput(p: {
  projectName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  projectUrl: string
  totalContractAmount: number
  status: CrmProjectStatus
  notes: string
  tasks: CrmTask[]
  transactions?: CrmPaymentTransaction[]
  progressPercent: number
  deliveryPhase: CrmProjectPhase
  maintenanceEnabled: boolean
  maintenanceMonthlyAmount: number
  maintenanceBillingDay: number
}): CrmProjectInput {
  const transactions = p.transactions ?? []
  return withSyncedFinancials({
    projectName: p.projectName,
    clientName: p.clientName,
    clientEmail: p.clientEmail,
    clientPhone: p.clientPhone ?? '',
    clientAddress: p.clientAddress ?? '',
    projectUrl: p.projectUrl,
    totalContractAmount: p.totalContractAmount,
    status: p.status,
    notes: p.notes,
    tasks: p.tasks ?? [],
    transactions,
    progressPercent: p.progressPercent,
    deliveryPhase: p.deliveryPhase,
    maintenanceEnabled: p.maintenanceEnabled,
    maintenanceMonthlyAmount: p.maintenanceMonthlyAmount,
    maintenanceBillingDay: p.maintenanceBillingDay,
  })
}
