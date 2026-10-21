import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import type { CrmMaintenanceInvoiceShare } from '@/types/crm-invoice-share'
import type { MaintenanceInvoicePrintProps } from '@/types/maintenance-invoice-print'
import {
  createMaintenanceInvoiceShareDb,
  getMaintenanceInvoiceShareDb,
} from '@/lib/supabase/crm-invoice-shares-db'
import { assertSupabaseCrmBackend, useSupabaseCrmBackend } from '@/lib/supabase/server'

const DATA_PATH = path.join(process.cwd(), 'data', 'crm-invoice-shares.json')

async function readAll(): Promise<CrmMaintenanceInvoiceShare[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    const parsed = JSON.parse(raw) as CrmMaintenanceInvoiceShare[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeAll(shares: CrmMaintenanceInvoiceShare[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
  await fs.writeFile(DATA_PATH, JSON.stringify(shares, null, 2), 'utf8')
}

export async function createMaintenanceInvoiceShare(input: {
  projectId: string
  periodKey: string
  invoiceNumber: string
  props: MaintenanceInvoicePrintProps
}): Promise<CrmMaintenanceInvoiceShare> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return createMaintenanceInvoiceShareDb(input)
  const share: CrmMaintenanceInvoiceShare = {
    id: randomUUID(),
    projectId: input.projectId,
    periodKey: input.periodKey,
    createdAt: new Date().toISOString(),
    invoiceNumber: input.invoiceNumber,
    props: input.props,
  }
  const all = await readAll()
  all.push(share)
  await writeAll(all.slice(-200))
  return share
}

export async function getMaintenanceInvoiceShare(id: string): Promise<CrmMaintenanceInvoiceShare | null> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return getMaintenanceInvoiceShareDb(id)
  const all = await readAll()
  return all.find((s) => s.id === id) ?? null
}
