'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlarmClock, Bell, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { formatInr } from '@/lib/format-currency'
import {
  billingDateForMonth,
  formatMonthLabel,
  monthKey,
  parseMonthKey,
  rollingMonths,
} from '@/lib/maintenance-schedule'
import {
  collectExpenseReminders,
  reminderHeadline,
  type ExpenseReminder,
} from '@/lib/monthly-expense-reminders'
import type { MonthlyExpense } from '@/types/crm-monthly-expense'

function ReminderCard({ reminder }: { reminder: ExpenseReminder }) {
  const styles =
    reminder.urgency === 'overdue'
      ? 'border-red-400/30 bg-gradient-to-br from-red-500/15 to-transparent'
      : reminder.urgency === 'due_today'
        ? 'border-amber-400/40 bg-gradient-to-br from-amber-500/20 to-transparent'
        : 'border-violet-400/25 bg-gradient-to-br from-violet-500/12 to-transparent'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 sm:p-5 ${styles}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30">
            <Bell className="h-5 w-5 text-platinum-metallic" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">{reminder.monthLabel}</p>
            <h3 className="font-luxury text-lg text-platinum-metallic truncate">{reminder.title}</h3>
            <p className="mt-1 text-sm font-medium text-platinum-200">{reminderHeadline(reminder)}</p>
            <p className="mt-1 text-xs text-platinum-500">
              Due{' '}
              {reminder.dueDate.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
              {' · '}
              Reminder {reminder.remindDaysBefore} days before
            </p>
          </div>
        </div>
        <p className="crm-stat-md shrink-0">{formatInr(reminder.amount)}</p>
      </div>
    </motion.div>
  )
}

export default function MonthlyExpensesBoard() {
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('1')
  const [remindDaysBefore, setRemindDaysBefore] = useState('3')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')

  const now = new Date()
  const [selectedKey, setSelectedKey] = useState(monthKey(now.getFullYear(), now.getMonth()))
  const { year, monthIndex } = parseMonthKey(selectedKey)

  const load = useCallback(async () => {
    setError(null)
    const res = await fetch('/api/automate/monthly-expenses')
    if (!res.ok) {
      setError('Could not load monthly expenses.')
      setLoading(false)
      return
    }
    const data = (await res.json()) as { expenses: MonthlyExpense[] }
    setExpenses(data.expenses)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const reminders = useMemo(() => collectExpenseReminders(expenses), [expenses])
  const active = useMemo(() => expenses.filter((e) => e.active), [expenses])
  const monthlyTotal = useMemo(() => active.reduce((sum, e) => sum + e.amount, 0), [active])

  const monthRows = useMemo(() => {
    return active
      .map((expense) => ({
        expense,
        dueDate: billingDateForMonth(year, monthIndex, expense.dueDay),
      }))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  }, [active, year, monthIndex])

  const rolling = useMemo(() => rollingMonths(6, now), [now])

  function shiftMonth(delta: number) {
    const d = new Date(year, monthIndex + delta, 1)
    setSelectedKey(monthKey(d.getFullYear(), d.getMonth()))
  }

  async function addExpense(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    const res = await fetch('/api/automate/monthly-expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        amount: Number(amount) || 0,
        dueDay: Number(dueDay) || 1,
        remindDaysBefore: Number(remindDaysBefore) || 3,
        category,
        note,
        active: true,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      setError('Could not add expense.')
      return
    }
    setTitle('')
    setAmount('')
    setCategory('')
    setNote('')
    await load()
  }

  async function patchExpense(id: string, patch: Partial<MonthlyExpense>) {
    const existing = expenses.find((e) => e.id === id)
    if (!existing) return
    setSaving(true)
    const res = await fetch(`/api/automate/monthly-expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...existing, ...patch }),
    })
    setSaving(false)
    if (!res.ok) setError('Could not update expense.')
    else await load()
  }

  async function removeExpense(id: string) {
    if (!window.confirm('Remove this monthly expense?')) return
    const res = await fetch(`/api/automate/monthly-expenses/${id}`, { method: 'DELETE' })
    if (!res.ok) setError('Could not delete expense.')
    else await load()
  }

  return (
    <div className="automate-page-container space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active expenses', value: loading ? '…' : String(active.length) },
          { label: 'Monthly outflow', value: loading ? '…' : formatInr(monthlyTotal) },
          { label: 'Reminders now', value: loading ? '…' : String(reminders.length) },
          { label: 'Annual run-rate', value: loading ? '…' : formatInr(monthlyTotal * 12) },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-platinum-500">{card.label}</p>
            <p className="mt-1 crm-stat-md">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] via-white/[0.02] to-transparent p-5 sm:p-7">
        <div className="flex items-center gap-3 mb-4">
          <AlarmClock className="h-6 w-6 text-violet-200" />
          <div>
            <h2 className="font-luxury text-xl text-platinum-metallic">Payment reminders</h2>
            <p className="text-sm text-platinum-400">
              Alerts appear 2 or 3 days before each due date (your choice), on the due date, and if overdue.
            </p>
          </div>
        </div>
        {loading ? (
          <p className="text-sm text-platinum-500">Loading reminders…</p>
        ) : reminders.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-platinum-500">
            No reminders right now. Add an expense with a due day — you will see alerts here starting a few days before.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {reminders.map((reminder) => (
              <ReminderCard key={`${reminder.expenseId}-${reminder.dueDate.toISOString()}`} reminder={reminder} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <h2 className="font-luxury text-lg text-platinum-metallic">Add monthly expense</h2>
        <p className="mt-1 text-xs text-platinum-500">Pick the due day each month. Choose how many days early you want the reminder.</p>
        <form onSubmit={addExpense} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2">
            <label className="crm-label">Expense name</label>
            <input className="crm-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Rent, salaries, software" required />
          </div>
          <div>
            <label className="crm-label">Amount (₹)</label>
            <input type="number" min={0} className="crm-input tabular-nums" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div>
            <label className="crm-label">Due day (1–28)</label>
            <input type="number" min={1} max={28} className="crm-input tabular-nums" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
          </div>
          <div>
            <label className="crm-label">Remind before</label>
            <select className="crm-input" value={remindDaysBefore} onChange={(e) => setRemindDaysBefore(e.target.value)}>
              <option value="2">2 days</option>
              <option value="3">3 days</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={saving} className="crm-primary-btn w-full inline-flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              {saving ? 'Saving…' : 'Add'}
            </button>
          </div>
          <div className="sm:col-span-2">
            <label className="crm-label">Category</label>
            <input className="crm-input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Operations, payroll, tools" />
          </div>
          <div className="sm:col-span-4">
            <label className="crm-label">Note</label>
            <input className="crm-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Vendor, account, or payment method" />
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
      </section>

      <div className="flex flex-wrap gap-2">
        {rolling.map(({ year: y, monthIndex: m }) => {
          const key = monthKey(y, m)
          const label = new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' }).format(new Date(y, m, 1))
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedKey(key)}
              className={`rounded-xl px-3 py-2 text-xs border transition-colors ${
                key === selectedKey
                  ? 'border-platinum-300/40 bg-platinum-metallic/10 text-platinum-metallic'
                  : 'border-white/10 text-platinum-500 hover:text-platinum-metallic'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-4 sm:px-6">
          <button type="button" onClick={() => shiftMonth(-1)} className="p-2 rounded-lg text-platinum-500 hover:bg-white/5">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-platinum-500">Schedule</p>
            <h2 className="font-luxury text-xl text-platinum-metallic">{formatMonthLabel(year, monthIndex)}</h2>
          </div>
          <button type="button" onClick={() => shiftMonth(1)} className="p-2 rounded-lg text-platinum-500 hover:bg-white/5">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        {monthRows.length === 0 ? (
          <p className="p-10 text-center text-sm text-platinum-500">No active expenses for this view.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {monthRows.map(({ expense, dueDate }) => (
              <li key={expense.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-white/10 bg-black/25">
                    <span className="text-[10px] uppercase text-platinum-500">{dueDate.toLocaleString('en-IN', { month: 'short' })}</span>
                    <span className="crm-stat text-lg text-platinum-200">{dueDate.getDate()}</span>
                  </div>
                  <div>
                    <p className="font-medium text-platinum-200">{expense.title}</p>
                    <p className="text-xs text-platinum-500">
                      {expense.category || 'General'} · Remind {expense.remindDaysBefore}d before
                    </p>
                  </div>
                </div>
                <p className="crm-stat-md">{formatInr(expense.amount)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {expenses.map((expense) => (
          <article key={expense.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-luxury text-lg text-platinum-metallic">{expense.title}</h3>
                <p className="text-xs text-platinum-500">{expense.category || 'General'}</p>
              </div>
              <button type="button" onClick={() => removeExpense(expense.id)} className="p-2 text-platinum-500 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 crm-stat text-2xl">{formatInr(expense.amount)}</p>
            <p className="mt-1 text-xs text-platinum-400">Due day {expense.dueDay} · Reminder {expense.remindDaysBefore} days before</p>
            {expense.note && <p className="mt-2 text-xs text-platinum-600">{expense.note}</p>}
            <label className="mt-4 inline-flex items-center gap-2 text-xs text-platinum-400">
              <input
                type="checkbox"
                checked={expense.active}
                disabled={saving}
                onChange={(e) => patchExpense(expense.id, { active: e.target.checked })}
                className="h-4 w-4 accent-violet-400"
              />
              Active (reminders on)
            </label>
          </article>
        ))}
      </div>
    </div>
  )
}
