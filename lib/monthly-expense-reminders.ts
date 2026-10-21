import { billingDateForMonth, formatMonthLabel } from '@/lib/maintenance-schedule'
import type { MonthlyExpense } from '@/types/crm-monthly-expense'

export type ReminderUrgency = 'upcoming' | 'due_today' | 'overdue'

export interface ExpenseReminder {
  expenseId: string
  title: string
  amount: number
  dueDate: Date
  daysUntil: number
  remindDaysBefore: number
  urgency: ReminderUrgency
  monthLabel: string
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const MS_PER_DAY = 86_400_000

export function remindersForExpense(expense: MonthlyExpense, anchor = new Date()): ExpenseReminder[] {
  if (!expense.active) return []
  const today = startOfDay(anchor)
  const items: ExpenseReminder[] = []

  for (let monthOffset = 0; monthOffset <= 1; monthOffset += 1) {
    const monthStart = new Date(anchor.getFullYear(), anchor.getMonth() + monthOffset, 1)
    const dueDate = billingDateForMonth(monthStart.getFullYear(), monthStart.getMonth(), expense.dueDay)
    const dueDay = startOfDay(dueDate)
    const daysUntil = Math.round((dueDay.getTime() - today.getTime()) / MS_PER_DAY)

    const overdue = monthOffset === 0 && daysUntil < 0
    const dueToday = daysUntil === 0
    const upcoming = daysUntil > 0 && daysUntil <= expense.remindDaysBefore

    if (!overdue && !dueToday && !upcoming) continue

    items.push({
      expenseId: expense.id,
      title: expense.title,
      amount: expense.amount,
      dueDate,
      daysUntil,
      remindDaysBefore: expense.remindDaysBefore,
      urgency: overdue ? 'overdue' : dueToday ? 'due_today' : 'upcoming',
      monthLabel: formatMonthLabel(monthStart.getFullYear(), monthStart.getMonth()),
    })
  }

  return items
}

export function collectExpenseReminders(expenses: MonthlyExpense[], anchor = new Date()): ExpenseReminder[] {
  return expenses
    .flatMap((expense) => remindersForExpense(expense, anchor))
    .sort((a, b) => a.daysUntil - b.daysUntil)
}

export function reminderHeadline(reminder: ExpenseReminder): string {
  if (reminder.urgency === 'overdue') {
    const days = Math.abs(reminder.daysUntil)
    return days === 1 ? 'Overdue by 1 day' : `Overdue by ${days} days`
  }
  if (reminder.urgency === 'due_today') return 'Due today — pay now'
  if (reminder.daysUntil === 1) return 'Due tomorrow'
  return `Due in ${reminder.daysUntil} days`
}
