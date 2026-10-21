import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import type { FinanceEntry, FinanceKind } from '@/types/crm-finance'
import {
  createFinanceEntryDb,
  deleteFinanceEntryDb,
  listFinanceEntriesDb,
} from '@/lib/supabase/crm-finance-db'
import { assertSupabaseCrmBackend, useSupabaseCrmBackend } from '@/lib/supabase/server'

export type { FinanceEntry, FinanceKind }

const DATA_FILE = path.join(process.cwd(), 'data', 'crm-finance.json')

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function normalize(raw: Partial<FinanceEntry>): FinanceEntry | null {
  const kind = raw.kind === 'cost' ? 'cost' : raw.kind === 'salary' ? 'salary' : null
  const label = typeof raw.label === 'string' ? raw.label.trim() : ''
  if (!kind || !label) return null
  const month = typeof raw.month === 'string' && /^\d{4}-\d{2}$/.test(raw.month) ? raw.month : currentMonth()
  return {
    id: raw.id || randomUUID(),
    kind,
    label,
    amount: Math.max(0, Number(raw.amount) || 0),
    month,
    note: typeof raw.note === 'string' ? raw.note.trim() : '',
    createdAt: raw.createdAt || new Date().toISOString(),
  }
}

async function readAll(): Promise<FinanceEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<FinanceEntry>[]
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item) => {
      const entry = normalize(item)
      return entry ? [entry] : []
    })
  } catch {
    return []
  }
}

async function writeAll(entries: FinanceEntry[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8')
}

export async function listFinanceEntries(): Promise<FinanceEntry[]> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return listFinanceEntriesDb()
  const entries = await readAll()
  return entries.sort((a, b) => (a.month === b.month ? b.createdAt.localeCompare(a.createdAt) : b.month.localeCompare(a.month)))
}

export async function createFinanceEntry(input: Omit<FinanceEntry, 'id' | 'createdAt'>): Promise<FinanceEntry | null> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return createFinanceEntryDb(input)
  const entry = normalize({ ...input, id: randomUUID(), createdAt: new Date().toISOString() })
  if (!entry) return null
  const entries = await readAll()
  entries.push(entry)
  await writeAll(entries)
  return entry
}

export async function deleteFinanceEntry(id: string): Promise<boolean> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return deleteFinanceEntryDb(id)
  const entries = await readAll()
  const next = entries.filter((entry) => entry.id !== id)
  if (next.length === entries.length) return false
  await writeAll(next)
  return true
}
