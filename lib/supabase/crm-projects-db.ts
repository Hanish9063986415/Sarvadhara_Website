import { randomUUID } from 'crypto'
import { parseDocuments, parseTasks, parseTransactions } from '@/lib/crm-project-api-parse'
import { dateOrNull, isoFromDate, isoFromTimestamptz } from '@/lib/supabase/crm-map'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import {
  clampBillingDay,
  clampProgress,
  financialsFromTransactions,
  normalizeDeliveryPhase,
  type CrmProject,
  type CrmProjectDocument,
  type CrmProjectInput,
  type CrmProjectStatus,
} from '@/types/crm-project'

function rowToDocuments(rows: Record<string, unknown>[]): CrmProjectDocument[] {
  return parseDocuments(
    rows.map((d) => ({
      id: String(d.id),
      label: String(d.label ?? ''),
      fileName: String(d.file_name ?? ''),
      mimeType: String(d.mime_type ?? ''),
      sizeBytes: Number(d.size_bytes) || 0,
      uploadedAt: isoFromTimestamptz(d.uploaded_at as string),
    }))
  )
}

function assembleProject(
  row: Record<string, unknown>,
  taskRows: Record<string, unknown>[],
  txnRows: Record<string, unknown>[],
  docRows: Record<string, unknown>[]
): CrmProject {
  const totalContractAmount = Number(row.total_contract_amount) || 0
  const transactions = parseTransactions(
    txnRows
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
      .map((t) => ({
        id: String(t.id),
        label: String(t.label ?? ''),
        amount: Number(t.amount) || 0,
        paidOn: isoFromDate(t.paid_on as string),
        note: String(t.note ?? ''),
      }))
  )
  const financials = financialsFromTransactions(totalContractAmount, transactions)
  const status = (['active', 'completed', 'on_hold'].includes(String(row.status))
    ? row.status
    : 'active') as CrmProjectStatus

  return {
    id: String(row.id),
    projectName: String(row.project_name ?? ''),
    clientName: String(row.client_name ?? ''),
    clientEmail: String(row.client_email ?? ''),
    clientPhone: String(row.client_phone ?? ''),
    clientAddress: String(row.client_address ?? ''),
    projectUrl: String(row.project_url ?? ''),
    totalContractAmount,
    firstTransactionAmount: financials.firstTransactionAmount,
    paymentsClearedAmount: financials.paymentsClearedAmount,
    transactions,
    balance: financials.balance,
    allPaymentsCleared: financials.allPaymentsCleared,
    status,
    notes: String(row.notes ?? ''),
    tasks: parseTasks(
      taskRows
        .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
        .map((t) => ({
          id: String(t.id),
          title: String(t.title ?? ''),
          description: String(t.description ?? ''),
          meter: Number(t.meter) || 0,
        }))
    ),
    progressPercent: clampProgress(Number(row.progress_percent) || 0),
    deliveryPhase: normalizeDeliveryPhase(row.delivery_phase),
    maintenanceEnabled: Boolean(row.maintenance_enabled),
    maintenanceMonthlyAmount: Math.max(0, Number(row.maintenance_monthly_amount) || 0),
    maintenanceBillingDay: clampBillingDay(Number(row.maintenance_billing_day) || 1),
    documents: rowToDocuments(docRows),
    createdAt: isoFromTimestamptz(row.created_at as string),
    updatedAt: isoFromTimestamptz(row.updated_at as string),
  }
}

async function loadChildren(projectIds: string[]) {
  const sb = getSupabaseAdmin()
  if (projectIds.length === 0) {
    return { tasks: [] as Record<string, unknown>[], txns: [] as Record<string, unknown>[], docs: [] as Record<string, unknown>[] }
  }
  const [tasksRes, txnsRes, docsRes] = await Promise.all([
    sb.from('crm_project_tasks').select('*').in('project_id', projectIds),
    sb.from('crm_project_payment_transactions').select('*').in('project_id', projectIds),
    sb.from('crm_project_documents').select('*').in('project_id', projectIds),
  ])
  if (tasksRes.error) throw new Error(tasksRes.error.message)
  if (txnsRes.error) throw new Error(txnsRes.error.message)
  if (docsRes.error) throw new Error(docsRes.error.message)
  return {
    tasks: (tasksRes.data ?? []) as Record<string, unknown>[],
    txns: (txnsRes.data ?? []) as Record<string, unknown>[],
    docs: (docsRes.data ?? []) as Record<string, unknown>[],
  }
}

function groupByProjectId(rows: Record<string, unknown>[]) {
  const map = new Map<string, Record<string, unknown>[]>()
  for (const row of rows) {
    const pid = String(row.project_id)
    if (!map.has(pid)) map.set(pid, [])
    map.get(pid)!.push(row)
  }
  return map
}

function projectRowFromInput(id: string, input: CrmProjectInput, financials: ReturnType<typeof financialsFromTransactions>, createdAt: string, updatedAt: string) {
  return {
    id,
    project_name: input.projectName.trim(),
    client_name: input.clientName.trim(),
    client_email: input.clientEmail.trim(),
    client_phone: input.clientPhone.trim(),
    client_address: input.clientAddress.replace(/^\s+|\s+$/g, ''),
    project_url: input.projectUrl.trim(),
    total_contract_amount: Math.max(0, input.totalContractAmount),
    first_transaction_amount: financials.firstTransactionAmount,
    payments_cleared_amount: financials.paymentsClearedAmount,
    balance: financials.balance,
    all_payments_cleared: financials.allPaymentsCleared,
    status: input.status,
    notes: input.notes.replace(/^\s+|\s+$/g, ''),
    progress_percent: clampProgress(input.progressPercent),
    delivery_phase: input.deliveryPhase,
    maintenance_enabled: input.maintenanceEnabled,
    maintenance_monthly_amount: Math.max(0, input.maintenanceMonthlyAmount),
    maintenance_billing_day: clampBillingDay(input.maintenanceBillingDay),
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

async function syncTasksAndTransactions(projectId: string, input: CrmProjectInput) {
  const sb = getSupabaseAdmin()
  const tasks = parseTasks(input.tasks)
  const transactions = parseTransactions(input.transactions)

  const { error: delTasks } = await sb.from('crm_project_tasks').delete().eq('project_id', projectId)
  if (delTasks) throw new Error(delTasks.message)
  const { error: delTxns } = await sb.from('crm_project_payment_transactions').delete().eq('project_id', projectId)
  if (delTxns) throw new Error(delTxns.message)

  if (tasks.length) {
    const taskRows = tasks.map((t, i) => ({
      id: t.id || randomUUID(),
      project_id: projectId,
      title: t.title.trim() || 'Task',
      description: t.description ?? '',
      meter: clampProgress(t.meter),
      sort_order: i,
    }))
    const { error } = await sb.from('crm_project_tasks').insert(taskRows)
    if (error) throw new Error(error.message)
  }

  if (transactions.length) {
    const txnRows = transactions.map((t, i) => ({
      id: t.id || randomUUID(),
      project_id: projectId,
      label: t.label ?? '',
      amount: Math.max(0, t.amount),
      paid_on: dateOrNull(t.paidOn),
      note: t.note ?? '',
      sort_order: i,
    }))
    const { error } = await sb.from('crm_project_payment_transactions').insert(txnRows)
    if (error) throw new Error(error.message)
  }
}

export async function listCrmProjectsDb(): Promise<CrmProject[]> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from('crm_projects').select('*')
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as Record<string, unknown>[]
  const ids = rows.map((r) => String(r.id))
  const { tasks, txns, docs } = await loadChildren(ids)
  const tasksBy = groupByProjectId(tasks)
  const txnsBy = groupByProjectId(txns)
  const docsBy = groupByProjectId(docs)
  const projects = rows.map((row) =>
    assembleProject(row, tasksBy.get(String(row.id)) ?? [], txnsBy.get(String(row.id)) ?? [], docsBy.get(String(row.id)) ?? [])
  )
  return projects.sort((a, b) => a.projectName.localeCompare(b.projectName))
}

export async function getCrmProjectDb(id: string): Promise<CrmProject | null> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from('crm_projects').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const { tasks, txns, docs } = await loadChildren([id])
  return assembleProject(data as Record<string, unknown>, tasks, txns, docs)
}

export async function createCrmProjectDb(input: CrmProjectInput): Promise<CrmProject> {
  const id = randomUUID()
  const now = new Date().toISOString()
  const transactions = parseTransactions(input.transactions)
  const financials = financialsFromTransactions(Math.max(0, input.totalContractAmount), transactions)
  const row = projectRowFromInput(id, input, financials, now, now)
  const sb = getSupabaseAdmin()
  const { error } = await sb.from('crm_projects').insert(row)
  if (error) throw new Error(error.message)
  await syncTasksAndTransactions(id, input)
  const created = await getCrmProjectDb(id)
  if (!created) throw new Error('Failed to load project after create')
  return created
}

export async function updateCrmProjectDb(id: string, input: CrmProjectInput): Promise<CrmProject | null> {
  const existing = await getCrmProjectDb(id)
  if (!existing) return null
  const now = new Date().toISOString()
  const transactions = parseTransactions(input.transactions)
  const financials = financialsFromTransactions(Math.max(0, input.totalContractAmount), transactions)
  const row = projectRowFromInput(id, input, financials, existing.createdAt, now)
  const { created_at: _created, ...updateRow } = row
  const sb = getSupabaseAdmin()
  const { error } = await sb.from('crm_projects').update(updateRow).eq('id', id)
  if (error) throw new Error(error.message)
  await syncTasksAndTransactions(id, input)
  return getCrmProjectDb(id)
}

export async function deleteCrmProjectDb(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin()
  const { error, count } = await sb.from('crm_projects').delete({ count: 'exact' }).eq('id', id)
  if (error) throw new Error(error.message)
  return (count ?? 0) > 0
}

export async function setCrmProjectDocumentsDb(
  id: string,
  documents: CrmProjectDocument[]
): Promise<CrmProject | null> {
  const existing = await getCrmProjectDb(id)
  if (!existing) return null
  const docs = parseDocuments(documents)
  const sb = getSupabaseAdmin()
  const { error: delErr } = await sb.from('crm_project_documents').delete().eq('project_id', id)
  if (delErr) throw new Error(delErr.message)
  if (docs.length) {
    const docRows = docs.map((d) => ({
      id: d.id,
      project_id: id,
      label: d.label,
      file_name: d.fileName,
      mime_type: d.mimeType,
      size_bytes: d.sizeBytes,
      storage_path: `${id}/${d.fileName}`,
      uploaded_at: d.uploadedAt || new Date().toISOString(),
    }))
    const { error } = await sb.from('crm_project_documents').insert(docRows)
    if (error) throw new Error(error.message)
  }
  const { error: touchErr } = await sb.from('crm_projects').update({ updated_at: new Date().toISOString() }).eq('id', id)
  if (touchErr) throw new Error(touchErr.message)
  return getCrmProjectDb(id)
}
