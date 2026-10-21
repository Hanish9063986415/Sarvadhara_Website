import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import type { CrmMaintenancePaymentRecord } from '@/types/crm-maintenance-record'
import {
  deleteMaintenancePaymentRecordDb,
  deleteMaintenanceRecordsForProjectDb,
  listMaintenancePaymentRecordsDb,
  upsertMaintenancePaymentRecordDb,
} from '@/lib/supabase/crm-maintenance-db'
import { assertSupabaseCrmBackend, useSupabaseCrmBackend } from '@/lib/supabase/server'

const DATA_FILE = path.join(process.cwd(), 'data', 'crm-maintenance-records.json')

function normalize(raw: Partial<CrmMaintenancePaymentRecord>): CrmMaintenancePaymentRecord | null {
  if (typeof raw.projectId !== 'string' || !raw.projectId.trim()) return null
  if (typeof raw.periodKey !== 'string' || !/^\d{4}-\d{2}$/.test(raw.periodKey)) return null
  const paidOn =
    typeof raw.paidOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.paidOn) ? raw.paidOn : ''
  const now = new Date().toISOString()
  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : randomUUID(),
    projectId: raw.projectId.trim(),
    periodKey: raw.periodKey,
    paidAmount: Math.max(0, Number(raw.paidAmount) || 0),
    paidOn,
    note: typeof raw.note === 'string' ? raw.note.trim().slice(0, 500) : '',
    updatedAt: now,
  }
}

async function readAll(): Promise<CrmMaintenancePaymentRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<CrmMaintenancePaymentRecord>[]
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item) => {
      const record = normalize(item)
      return record ? [record] : []
    })
  } catch {
    return []
  }
}

async function writeAll(records: CrmMaintenancePaymentRecord[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8')
}

export async function listMaintenancePaymentRecords(): Promise<CrmMaintenancePaymentRecord[]> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return listMaintenancePaymentRecordsDb()
  return readAll()
}

export async function upsertMaintenancePaymentRecord(input: {
  projectId: string
  periodKey: string
  paidAmount: number
  paidOn: string
  note: string
}): Promise<CrmMaintenancePaymentRecord> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return upsertMaintenancePaymentRecordDb(input)
  const items = await readAll()
  const index = items.findIndex(
    (r) => r.projectId === input.projectId && r.periodKey === input.periodKey
  )
  const now = new Date().toISOString()
  if (index === -1) {
    const created = normalize({
      id: randomUUID(),
      projectId: input.projectId,
      periodKey: input.periodKey,
      paidAmount: input.paidAmount,
      paidOn: input.paidOn,
      note: input.note,
      updatedAt: now,
    })!
    items.push(created)
    await writeAll(items)
    return created
  }
  const updated = normalize({
    ...items[index],
    paidAmount: input.paidAmount,
    paidOn: input.paidOn,
    note: input.note,
    updatedAt: now,
  })!
  items[index] = updated
  await writeAll(items)
  return updated
}

export async function deleteMaintenancePaymentRecord(
  projectId: string,
  periodKey: string
): Promise<boolean> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return deleteMaintenancePaymentRecordDb(projectId, periodKey)
  const items = await readAll()
  const next = items.filter((r) => !(r.projectId === projectId && r.periodKey === periodKey))
  if (next.length === items.length) return false
  await writeAll(next)
  return true
}

export async function deleteMaintenanceRecordsForProject(projectId: string): Promise<number> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return deleteMaintenanceRecordsForProjectDb(projectId)
  const items = await readAll()
  const next = items.filter((r) => r.projectId !== projectId)
  const removed = items.length - next.length
  if (removed === 0) return 0
  await writeAll(next)
  return removed
}
