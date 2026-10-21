import { randomUUID } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { isoFromTimestamptz } from '@/lib/supabase/crm-map'
import { clampDueDay, clampRemindDays, type MonthlyExpense } from '@/types/crm-monthly-expense'

function rowToExpense(row: Record<string, unknown>): MonthlyExpense {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    amount: Number(row.amount) || 0,
    dueDay: clampDueDay(Number(row.due_day) || 1),
    remindDaysBefore: clampRemindDays(Number(row.remind_days_before) || 3),
    category: String(row.category ?? ''),
    note: String(row.note ?? ''),
    active: row.active !== false,
    createdAt: isoFromTimestamptz(row.created_at as string),
    updatedAt: isoFromTimestamptz(row.updated_at as string),
  }
}

export async function listMonthlyExpensesDb(): Promise<MonthlyExpense[]> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from('crm_monthly_expenses').select('*')
  if (error) throw new Error(error.message)
  const items = (data ?? []).map((r) => rowToExpense(r as Record<string, unknown>))
  return items.sort((a, b) => a.dueDay - b.dueDay || a.title.localeCompare(b.title))
}

export async function createMonthlyExpenseDb(
  input: Omit<MonthlyExpense, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MonthlyExpense | null> {
  const sb = getSupabaseAdmin()
  const id = randomUUID()
  const row = {
    id,
    title: input.title.trim(),
    amount: Math.max(0, input.amount),
    due_day: clampDueDay(input.dueDay),
    remind_days_before: clampRemindDays(input.remindDaysBefore),
    category: input.category.trim().slice(0, 80),
    note: input.note.trim().slice(0, 500),
    active: input.active !== false,
  }
  const { data, error } = await sb.from('crm_monthly_expenses').insert(row).select('*').single()
  if (error) throw new Error(error.message)
  return rowToExpense(data as Record<string, unknown>)
}

export async function updateMonthlyExpenseDb(
  id: string,
  input: Omit<MonthlyExpense, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MonthlyExpense | null> {
  const sb = getSupabaseAdmin()
  const row = {
    title: input.title.trim(),
    amount: Math.max(0, input.amount),
    due_day: clampDueDay(input.dueDay),
    remind_days_before: clampRemindDays(input.remindDaysBefore),
    category: input.category.trim().slice(0, 80),
    note: input.note.trim().slice(0, 500),
    active: input.active !== false,
  }
  const { data, error } = await sb.from('crm_monthly_expenses').update(row).eq('id', id).select('*').single()
  if (error) throw new Error(error.message)
  return rowToExpense(data as Record<string, unknown>)
}

export async function deleteMonthlyExpenseDb(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin()
  const { error, count } = await sb.from('crm_monthly_expenses').delete({ count: 'exact' }).eq('id', id)
  if (error) throw new Error(error.message)
  return (count ?? 0) > 0
}
