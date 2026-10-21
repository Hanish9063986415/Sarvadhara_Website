export interface MonthlyExpense {
  id: string
  title: string
  amount: number
  /** Day of month (1–28) when payment is due */
  dueDay: number
  /** Show reminders this many days before due day (2–7) */
  remindDaysBefore: number
  category: string
  note: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export function clampDueDay(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.min(28, Math.max(1, Math.round(value)))
}

export function clampRemindDays(value: number): number {
  if (!Number.isFinite(value)) return 3
  return Math.min(7, Math.max(2, Math.round(value)))
}
