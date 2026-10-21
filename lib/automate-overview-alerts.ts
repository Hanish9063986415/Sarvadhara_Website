import {
  AUTOMATE_PROJECTS_EXPENSES_PATH,
  AUTOMATE_PROJECTS_MAINTENANCE_PATH,
  AUTOMATE_PROJECTS_TRACK_PATH,
  maintenanceProjectHistoryPath,
  projectRecordPath,
} from '@/lib/automate-routes'
import { summarizeMaintenanceMonth } from '@/lib/maintenance-ledger-calc'
import {
  clearanceDateForMonth,
  formatClearanceLabel,
  formatMonthLabel,
  monthKey,
} from '@/lib/maintenance-schedule'
import {
  collectExpenseReminders,
  reminderHeadline,
  type ExpenseReminder,
} from '@/lib/monthly-expense-reminders'
import type { CrmProject } from '@/types/crm-project'
import type { CrmMaintenancePaymentRecord } from '@/types/crm-maintenance-record'
import type { MonthlyExpense } from '@/types/crm-monthly-expense'

export type AutomateAlertKind = 'expense' | 'maintenance' | 'project_payment' | 'project_status'

export type AutomateAlertUrgency = 'critical' | 'warning' | 'info'

export interface AutomateOverviewAlert {
  id: string
  kind: AutomateAlertKind
  urgency: AutomateAlertUrgency
  title: string
  message: string
  amount?: number
  href: string
  badge?: string
}

export interface AutomateOverviewAlertsPayload {
  generatedAt: string
  monthLabel: string
  clearanceLabel: string
  counts: { critical: number; warning: number; info: number; total: number }
  alerts: AutomateOverviewAlert[]
}

const MS_PER_DAY = 86_400_000

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function urgencyRank(u: AutomateAlertUrgency): number {
  if (u === 'critical') return 0
  if (u === 'warning') return 1
  return 2
}

function sortAlerts(alerts: AutomateOverviewAlert[]): AutomateOverviewAlert[] {
  return [...alerts].sort((a, b) => {
    const r = urgencyRank(a.urgency) - urgencyRank(b.urgency)
    if (r !== 0) return r
    return (b.amount ?? 0) - (a.amount ?? 0)
  })
}

function expenseAlerts(reminders: ExpenseReminder[]): AutomateOverviewAlert[] {
  return reminders.map((r) => ({
    id: `expense-${r.expenseId}-${r.dueDate.toISOString()}`,
    kind: 'expense' as const,
    urgency: r.urgency === 'overdue' ? 'critical' : r.urgency === 'due_today' ? 'warning' : 'info',
    title: r.title,
    message: reminderHeadline(r),
    amount: r.amount,
    href: AUTOMATE_PROJECTS_EXPENSES_PATH,
    badge: r.monthLabel,
  }))
}

function maintenanceAlerts(
  projects: CrmProject[],
  records: CrmMaintenancePaymentRecord[],
  clearanceDay: number,
  anchor = new Date()
): AutomateOverviewAlert[] {
  const year = anchor.getFullYear()
  const monthIndex = anchor.getMonth()
  const periodKey = monthKey(year, monthIndex)
  const monthLabel = formatMonthLabel(year, monthIndex)
  const clearanceDate = clearanceDateForMonth(year, monthIndex, clearanceDay)
  const clearanceLabel = formatClearanceLabel(clearanceDate)
  const today = startOfDay(anchor)
  const clearanceDayStart = startOfDay(clearanceDate)
  const daysToClearance = Math.round((clearanceDayStart.getTime() - today.getTime()) / MS_PER_DAY)
  const pastClearance = daysToClearance < 0

  const summary = summarizeMaintenanceMonth(projects, year, monthIndex, records)
  const nameById = new Map(projects.map((p) => [p.id, p.projectName]))

  const items: AutomateOverviewAlert[] = []

  for (const row of summary.rows) {
    if (row.balance <= 0) continue
    const projectName = nameById.get(row.projectId) ?? 'Project'
    let urgency: AutomateAlertUrgency = 'info'
    if (pastClearance) urgency = 'critical'
    else if (row.status === 'partial' || daysToClearance <= 3) urgency = 'warning'

    const statusLabel =
      row.status === 'partial' ? 'Partially paid' : row.status === 'paid' ? 'Paid' : 'Unpaid'

    items.push({
      id: `maint-${row.projectId}-${periodKey}`,
      kind: 'maintenance',
      urgency,
      title: projectName,
      message:
        row.carryIn > 0
          ? `${statusLabel} · includes carry-forward · clear by ${clearanceLabel}`
          : `${statusLabel} for ${monthLabel} · clear by ${clearanceLabel}`,
      amount: row.balance,
      href: maintenanceProjectHistoryPath(row.projectId, periodKey),
      badge: row.status === 'partial' ? 'Partial' : 'Due',
    })
  }

  return items
}

function projectPaymentAlerts(projects: CrmProject[]): AutomateOverviewAlert[] {
  return projects
    .filter((p) => p.balance > 0.01 && p.status !== 'completed')
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 8)
    .map((p) => ({
      id: `pay-${p.id}`,
      kind: 'project_payment' as const,
      urgency: p.balance >= p.totalContractAmount * 0.5 ? 'warning' : 'info',
      title: p.projectName,
      message: p.allPaymentsCleared
        ? 'Review contract balance'
        : `${p.status === 'on_hold' ? 'On hold · ' : ''}Contract balance remaining`,
      amount: p.balance,
      href: projectRecordPath(p.id),
      badge: 'Vault',
    }))
}

function projectStatusAlerts(projects: CrmProject[]): AutomateOverviewAlert[] {
  return projects
    .filter((p) => p.status === 'on_hold')
    .slice(0, 5)
    .map((p) => ({
      id: `status-${p.id}`,
      kind: 'project_status' as const,
      urgency: 'info' as const,
      title: p.projectName,
      message: 'Project is on hold — review track board when ready to resume.',
      href: AUTOMATE_PROJECTS_TRACK_PATH,
      badge: 'On hold',
    }))
}

export function buildAutomateOverviewAlerts(input: {
  projects: CrmProject[]
  expenses: MonthlyExpense[]
  maintenanceRecords: CrmMaintenancePaymentRecord[]
  clearanceDay: number
  anchor?: Date
  maxAlerts?: number
}): AutomateOverviewAlertsPayload {
  const anchor = input.anchor ?? new Date()
  const year = anchor.getFullYear()
  const monthIndex = anchor.getMonth()
  const clearanceDate = clearanceDateForMonth(year, monthIndex, input.clearanceDay)

  const expenseItems = expenseAlerts(collectExpenseReminders(input.expenses, anchor))
  const maintenanceItems = maintenanceAlerts(
    input.projects,
    input.maintenanceRecords,
    input.clearanceDay,
    anchor
  )
  const paymentItems = projectPaymentAlerts(input.projects)
  const statusItems = projectStatusAlerts(input.projects)

  const merged = sortAlerts([...expenseItems, ...maintenanceItems, ...paymentItems, ...statusItems])
  const max = input.maxAlerts ?? 24
  const alerts = merged.slice(0, max)

  const counts = {
    critical: alerts.filter((a) => a.urgency === 'critical').length,
    warning: alerts.filter((a) => a.urgency === 'warning').length,
    info: alerts.filter((a) => a.urgency === 'info').length,
    total: alerts.length,
  }

  return {
    generatedAt: anchor.toISOString(),
    monthLabel: formatMonthLabel(year, monthIndex),
    clearanceLabel: formatClearanceLabel(clearanceDate),
    counts,
    alerts,
  }
}
