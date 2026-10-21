'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { AUTOMATE_PROJECTS_EXPENSES_PATH } from '@/lib/automate-routes'
import { collectExpenseReminders, reminderHeadline } from '@/lib/monthly-expense-reminders'
import { formatInr } from '@/lib/format-currency'
import type { MonthlyExpense } from '@/types/crm-monthly-expense'

export default function ExpenseRemindersStrip() {
  const [reminders, setReminders] = useState<ReturnType<typeof collectExpenseReminders>>([])

  useEffect(() => {
    fetch('/api/automate/monthly-expenses')
      .then((res) => (res.ok ? res.json() : { expenses: [] }))
      .then((data: { expenses: MonthlyExpense[] }) => {
        setReminders(collectExpenseReminders(data.expenses).slice(0, 3))
      })
      .catch(() => setReminders([]))
  }, [])

  if (reminders.length === 0) return null

  return (
    <section className="rounded-2xl border border-violet-400/25 bg-gradient-to-r from-violet-500/10 to-transparent p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm text-violet-100">
          <Bell className="h-4 w-4" />
          Upcoming expense reminders
        </div>
        <Link href={AUTOMATE_PROJECTS_EXPENSES_PATH} className="text-xs uppercase tracking-wider text-platinum-400 hover:text-platinum-metallic">
          View all →
        </Link>
      </div>
      <ul className="space-y-2">
        {reminders.map((r) => (
          <li key={`${r.expenseId}-${r.dueDate.toISOString()}`} className="flex justify-between gap-3 text-sm">
            <span className="text-platinum-200 truncate">
              {r.title} · {reminderHeadline(r)}
            </span>
            <span className="crm-stat-sm shrink-0">{formatInr(r.amount)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
