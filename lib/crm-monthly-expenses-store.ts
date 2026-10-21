import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import {
  clampDueDay,
  clampRemindDays,
  type MonthlyExpense,
} from '@/types/crm-monthly-expense'
import {
  createMonthlyExpenseDb,
  deleteMonthlyExpenseDb,
  listMonthlyExpensesDb,
  updateMonthlyExpenseDb,
} from '@/lib/supabase/crm-expenses-db'
import { assertSupabaseCrmBackend, useSupabaseCrmBackend } from '@/lib/supabase/server'

const DATA_FILE = path.join(process.cwd(), 'data', 'crm-monthly-expenses.json')

function normalize(raw: Partial<MonthlyExpense>): MonthlyExpense | null {
  const title = typeof raw.title === 'string' ? raw.title.trim() : ''
  if (!title) return null
  const now = new Date().toISOString()
  return {
    id: raw.id || randomUUID(),
    title,
    amount: Math.max(0, Number(raw.amount) || 0),
    dueDay: clampDueDay(Number(raw.dueDay) || 1),
    remindDaysBefore: clampRemindDays(Number(raw.remindDaysBefore) || 3),
    category: typeof raw.category === 'string' ? raw.category.trim().slice(0, 80) : '',
    note: typeof raw.note === 'string' ? raw.note.trim().slice(0, 500) : '',
    active: raw.active !== false,
    createdAt: raw.createdAt || now,
    updatedAt: now,
  }
}

async function readAll(): Promise<MonthlyExpense[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<MonthlyExpense>[]
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item) => {
      const expense = normalize(item)
      return expense ? [expense] : []
    })
  } catch {
    return []
  }
}

async function writeAll(expenses: MonthlyExpense[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(expenses, null, 2), 'utf-8')
}

export async function listMonthlyExpenses(): Promise<MonthlyExpense[]> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return listMonthlyExpensesDb()
  const items = await readAll()
  return items.sort((a, b) => a.dueDay - b.dueDay || a.title.localeCompare(b.title))
}

export async function createMonthlyExpense(
  input: Omit<MonthlyExpense, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MonthlyExpense | null> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return createMonthlyExpenseDb(input)
  const expense = normalize({ ...input, id: randomUUID(), createdAt: new Date().toISOString() })
  if (!expense) return null
  const items = await readAll()
  items.push(expense)
  await writeAll(items)
  return expense
}

export async function updateMonthlyExpense(
  id: string,
  input: Omit<MonthlyExpense, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MonthlyExpense | null> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return updateMonthlyExpenseDb(id, input)
  const items = await readAll()
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return null
  const existing = items[index]
  const expense = normalize({
    ...input,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  })
  if (!expense) return null
  items[index] = expense
  await writeAll(items)
  return expense
}

export async function deleteMonthlyExpense(id: string): Promise<boolean> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return deleteMonthlyExpenseDb(id)
  const items = await readAll()
  const next = items.filter((item) => item.id !== id)
  if (next.length === items.length) return false
  await writeAll(next)
  return true
}
