import { randomUUID } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { isoFromTimestamptz } from '@/lib/supabase/crm-map'
import type { FinanceEntry } from '@/types/crm-finance'

function rowToEntry(row: Record<string, unknown>): FinanceEntry {
  return {
    id: String(row.id),
    kind: row.kind === 'cost' ? 'cost' : 'salary',
    label: String(row.label ?? ''),
    amount: Number(row.amount) || 0,
    month: String(row.month),
    note: String(row.note ?? ''),
    createdAt: isoFromTimestamptz(row.created_at as string),
  }
}

export async function listFinanceEntriesDb(): Promise<FinanceEntry[]> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from('crm_finance_entries').select('*')
  if (error) throw new Error(error.message)
  const entries = (data ?? []).map((r) => rowToEntry(r as Record<string, unknown>))
  return entries.sort((a, b) =>
    a.month === b.month ? b.createdAt.localeCompare(a.createdAt) : b.month.localeCompare(a.month)
  )
}

export async function createFinanceEntryDb(
  input: Omit<FinanceEntry, 'id' | 'createdAt'>
): Promise<FinanceEntry | null> {
  const sb = getSupabaseAdmin()
  const row = {
    id: randomUUID(),
    kind: input.kind,
    label: input.label.trim(),
    amount: Math.max(0, input.amount),
    month: input.month,
    note: input.note.trim(),
  }
  const { data, error } = await sb.from('crm_finance_entries').insert(row).select('*').single()
  if (error) throw new Error(error.message)
  return rowToEntry(data as Record<string, unknown>)
}

export async function deleteFinanceEntryDb(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin()
  const { error, count } = await sb.from('crm_finance_entries').delete({ count: 'exact' }).eq('id', id)
  if (error) throw new Error(error.message)
  return (count ?? 0) > 0
}
