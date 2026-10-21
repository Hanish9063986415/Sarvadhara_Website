import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { portfolioProjects } from '@/data/portfolio'
import {
  legacyTransactionsFromAmounts,
  parseDocuments,
  parseTasks,
  parseTransactions,
} from '@/lib/crm-project-api-parse'
import { deleteProjectDocumentFiles } from '@/lib/crm-project-documents'
import {
  createCrmProjectDb,
  deleteCrmProjectDb,
  getCrmProjectDb,
  listCrmProjectsDb,
  setCrmProjectDocumentsDb,
  updateCrmProjectDb,
} from '@/lib/supabase/crm-projects-db'
import { assertSupabaseCrmBackend, useSupabaseCrmBackend } from '@/lib/supabase/server'
import {
  clampBillingDay,
  clampProgress,
  defaultCrmProjectFields,
  financialsFromTransactions,
  normalizeDeliveryPhase,
  type CrmProject,
  type CrmProjectInput,
  type CrmProjectStatus,
} from '@/types/crm-project'

function normalizeProject(raw: Partial<CrmProject>): CrmProject {
  const defaults = defaultCrmProjectFields()
  const totalContractAmount = Math.max(0, Number(raw.totalContractAmount) || 0)
  let transactions = parseTransactions(raw.transactions)
  if (transactions.length === 0) {
    transactions = legacyTransactionsFromAmounts(
      Number(raw.firstTransactionAmount) || 0,
      Number(raw.paymentsClearedAmount) || 0
    )
  }
  const financials = financialsFromTransactions(totalContractAmount, transactions)
  return {
    id: raw.id ?? '',
    projectName: raw.projectName ?? '',
    clientName: raw.clientName ?? '',
    clientEmail: raw.clientEmail ?? '',
    clientPhone: raw.clientPhone ?? '',
    clientAddress: raw.clientAddress ?? '',
    projectUrl: raw.projectUrl ?? '',
    totalContractAmount,
    firstTransactionAmount: financials.firstTransactionAmount,
    paymentsClearedAmount: financials.paymentsClearedAmount,
    transactions,
    balance: financials.balance,
    allPaymentsCleared: financials.allPaymentsCleared,
    status: (['active', 'completed', 'on_hold'].includes(raw.status as string)
      ? raw.status
      : 'active') as CrmProjectStatus,
    notes: raw.notes ?? '',
    tasks: parseTasks(raw.tasks),
    progressPercent: clampProgress(Number(raw.progressPercent ?? defaults.progressPercent)),
    deliveryPhase: normalizeDeliveryPhase(raw.deliveryPhase ?? defaults.deliveryPhase),
    maintenanceEnabled: Boolean(raw.maintenanceEnabled ?? defaults.maintenanceEnabled),
    maintenanceMonthlyAmount: Math.max(
      0,
      Number(raw.maintenanceMonthlyAmount ?? defaults.maintenanceMonthlyAmount)
    ),
    maintenanceBillingDay: clampBillingDay(
      Number(raw.maintenanceBillingDay ?? defaults.maintenanceBillingDay)
    ),
    documents: parseDocuments(raw.documents),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
}

const DATA_FILE = path.join(process.cwd(), 'data', 'crm-projects.json')

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE)
  } catch {
    const seeded: CrmProject[] = portfolioProjects.map((p) => {
      const now = new Date().toISOString()
      const fields = defaultCrmProjectFields()
      const financials = financialsFromTransactions(0, [])
      return {
        id: randomUUID(),
        projectName: p.title,
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        projectUrl: p.link,
        totalContractAmount: 0,
        firstTransactionAmount: 0,
        paymentsClearedAmount: 0,
        transactions: [],
        balance: financials.balance,
        allPaymentsCleared: financials.allPaymentsCleared,
        status: 'active' as CrmProjectStatus,
        notes: '',
        tasks: [],
        documents: [],
        ...fields,
        createdAt: now,
        updatedAt: now,
      }
    })
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(seeded, null, 2), 'utf-8')
  }
}

async function readAll(): Promise<CrmProject[]> {
  await ensureDataFile()
  const raw = await fs.readFile(DATA_FILE, 'utf-8')
  const parsed = JSON.parse(raw) as Partial<CrmProject>[]
  return Array.isArray(parsed) ? parsed.map((p) => normalizeProject(p)) : []
}

async function writeAll(projects: CrmProject[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8')
}

function buildProject(input: CrmProjectInput, existing?: CrmProject): CrmProject {
  const now = new Date().toISOString()
  const transactions = parseTransactions(input.transactions)
  const totalContractAmount = Math.max(0, input.totalContractAmount)
  const financials = financialsFromTransactions(totalContractAmount, transactions)

  return {
    id: existing?.id ?? randomUUID(),
    projectName: input.projectName.trim(),
    clientName: input.clientName.trim(),
    clientEmail: input.clientEmail.trim(),
    clientPhone: input.clientPhone.trim(),
    clientAddress: input.clientAddress.replace(/^\s+|\s+$/g, ''),
    projectUrl: input.projectUrl.trim(),
    totalContractAmount,
    firstTransactionAmount: financials.firstTransactionAmount,
    paymentsClearedAmount: financials.paymentsClearedAmount,
    transactions,
    balance: financials.balance,
    allPaymentsCleared: financials.allPaymentsCleared,
    status: input.status,
    notes: input.notes.replace(/^\s+|\s+$/g, ''),
    tasks: parseTasks(input.tasks),
    progressPercent: clampProgress(input.progressPercent),
    deliveryPhase: input.deliveryPhase,
    maintenanceEnabled: input.maintenanceEnabled,
    maintenanceMonthlyAmount: Math.max(0, input.maintenanceMonthlyAmount),
    maintenanceBillingDay: clampBillingDay(input.maintenanceBillingDay),
    documents: parseDocuments(existing?.documents),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

export async function setCrmProjectDocuments(
  id: string,
  documents: ReturnType<typeof parseDocuments>
): Promise<CrmProject | null> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return setCrmProjectDocumentsDb(id, documents)
  const projects = await readAll()
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return null
  const now = new Date().toISOString()
  projects[index] = {
    ...projects[index],
    documents: parseDocuments(documents),
    updatedAt: now,
  }
  await writeAll(projects)
  return projects[index]
}

export async function listCrmProjects(): Promise<CrmProject[]> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return listCrmProjectsDb()
  const projects = await readAll()
  return projects.sort((a, b) => a.projectName.localeCompare(b.projectName))
}

export async function getCrmProject(id: string): Promise<CrmProject | null> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return getCrmProjectDb(id)
  const projects = await readAll()
  return projects.find((p) => p.id === id) ?? null
}

export async function createCrmProject(input: CrmProjectInput): Promise<CrmProject> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return createCrmProjectDb(input)
  const projects = await readAll()
  const project = buildProject(input)
  projects.push(project)
  await writeAll(projects)
  return project
}

export async function updateCrmProject(
  id: string,
  input: CrmProjectInput
): Promise<CrmProject | null> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return updateCrmProjectDb(id, input)
  const projects = await readAll()
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return null
  const updated = buildProject(input, projects[index])
  projects[index] = updated
  await writeAll(projects)
  return updated
}

export async function deleteCrmProject(id: string): Promise<boolean> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) {
    const ok = await deleteCrmProjectDb(id)
    if (ok) await deleteProjectDocumentFiles(id).catch(() => {})
    return ok
  }
  const projects = await readAll()
  const next = projects.filter((p) => p.id !== id)
  if (next.length === projects.length) return false
  await writeAll(next)
  await deleteProjectDocumentFiles(id).catch(() => {})
  return true
}

export async function getCrmSummary() {
  const projects = await listCrmProjects()
  return projects.reduce(
    (acc, p) => {
      acc.count += 1
      acc.totalContract += p.totalContractAmount
      acc.totalCleared += p.paymentsClearedAmount
      acc.totalBalance += p.balance
      if (p.allPaymentsCleared) acc.fullyPaid += 1
      return acc
    },
    { count: 0, totalContract: 0, totalCleared: 0, totalBalance: 0, fullyPaid: 0 }
  )
}
