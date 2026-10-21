import { monthKey, parseMonthKey } from '@/lib/maintenance-schedule'
import type {
  CrmMaintenancePaymentRecord,
  MaintenancePeriodLedger,
  MaintenancePaymentStatus,
  MaintenanceProjectHistory,
  MaintenanceProjectHistoryEntry,
} from '@/types/crm-maintenance-record'
import type { CrmProject } from '@/types/crm-project'

export function monthIndexFromKey(periodKey: string): { year: number; monthIndex: number } {
  return parseMonthKey(periodKey)
}

export function comparePeriodKeys(a: string, b: string): number {
  return a.localeCompare(b)
}

export function eachMonthBetween(
  from: { year: number; monthIndex: number },
  toExclusive: { year: number; monthIndex: number }
): { year: number; monthIndex: number }[] {
  const months: { year: number; monthIndex: number }[] = []
  let y = from.year
  let m = from.monthIndex
  while (y < toExclusive.year || (y === toExclusive.year && m < toExclusive.monthIndex)) {
    months.push({ year: y, monthIndex: m })
    m += 1
    if (m > 11) {
      m = 0
      y += 1
    }
  }
  return months
}

export function maintenanceBillingStart(project: CrmProject): { year: number; monthIndex: number } {
  const anchor = project.createdAt ? new Date(project.createdAt) : new Date()
  if (Number.isNaN(anchor.getTime())) {
    const now = new Date()
    return { year: now.getFullYear(), monthIndex: now.getMonth() }
  }
  return { year: anchor.getFullYear(), monthIndex: anchor.getMonth() }
}

export function paidForPeriod(
  projectId: string,
  periodKey: string,
  records: CrmMaintenancePaymentRecord[]
): number {
  const match = records.find((r) => r.projectId === projectId && r.periodKey === periodKey)
  return match ? Math.max(0, match.paidAmount) : 0
}

/** Remaining amount to collect for the period (0 when fully paid). */
export function maintenanceRemainingDue(
  ledger: { balance: number } | undefined,
  fallbackMonthlyFee = 0
): number {
  if (!ledger) return Math.max(0, fallbackMonthlyFee)
  return ledger.balance
}

/** Carry shown on billing rows — cleared when the month is fully paid. */
export function maintenanceDisplayCarryIn(ledger: MaintenancePeriodLedger | undefined): number {
  if (!ledger || ledger.status === 'paid') return 0
  return ledger.carryIn
}

function statusFrom(due: number, paid: number): MaintenancePaymentStatus {
  if (due <= 0) return 'paid'
  if (paid >= due - 0.01) return 'paid'
  if (paid > 0) return 'partial'
  return 'unpaid'
}

export function computeMaintenancePeriodLedger(
  project: CrmProject,
  year: number,
  monthIndex: number,
  records: CrmMaintenancePaymentRecord[]
): MaintenancePeriodLedger {
  const periodKey = monthKey(year, monthIndex)
  const monthlyFee = Math.max(0, project.maintenanceMonthlyAmount)
  const start = maintenanceBillingStart(project)
  const target = { year, monthIndex }

  let carryIn = 0
  const carryFromPeriods: string[] = []

  for (const m of eachMonthBetween(start, target)) {
    const key = monthKey(m.year, m.monthIndex)
    const priorDue = monthlyFee + carryIn
    const priorPaid = paidForPeriod(project.id, key, records)
    const priorBalance = Math.max(0, Math.round((priorDue - priorPaid) * 100) / 100)
    if (priorBalance > 0) {
      carryFromPeriods.push(key)
    }
    carryIn = priorBalance
  }

  const amountDue = Math.round((monthlyFee + carryIn) * 100) / 100
  const paidAmount = paidForPeriod(project.id, periodKey, records)
  const balance = Math.max(0, Math.round((amountDue - paidAmount) * 100) / 100)
  const record = records.find((r) => r.projectId === project.id && r.periodKey === periodKey) ?? null

  return {
    periodKey,
    projectId: project.id,
    monthlyFee,
    carryIn,
    amountDue,
    paidAmount,
    balance,
    status: statusFrom(amountDue, paidAmount),
    carryFromPeriods,
    recordId: record?.id ?? null,
  }
}

export function summarizeMaintenanceMonth(
  projects: CrmProject[],
  year: number,
  monthIndex: number,
  records: CrmMaintenancePaymentRecord[]
) {
  const maintainable = projects.filter((p) => p.maintenanceEnabled && p.maintenanceMonthlyAmount > 0)
  const rows = maintainable.map((p) => computeMaintenancePeriodLedger(p, year, monthIndex, records))
  const totalMonthlyFees = rows.reduce((s, r) => s + r.monthlyFee, 0)
  const totalCarryIn = rows.reduce((s, r) => s + r.carryIn, 0)
  const totalDue = rows.reduce((s, r) => s + r.balance, 0)
  const totalPaid = rows.reduce((s, r) => s + r.paidAmount, 0)
  const totalOutstanding = rows.reduce((s, r) => s + r.balance, 0)
  const unpaidProjects = rows.filter((r) => r.balance > 0).length
  const paidProjects = rows.filter((r) => r.status === 'paid').length
  const partialProjects = rows.filter((r) => r.status === 'partial').length
  return {
    rows,
    totalMonthlyFees,
    totalCarryIn,
    totalDue,
    totalPaid,
    totalOutstanding,
    unpaidProjects,
    paidProjects,
    partialProjects,
    projectCount: rows.length,
  }
}

function recordMeta(
  projectId: string,
  periodKey: string,
  records: CrmMaintenancePaymentRecord[]
): { paidOn: string; note: string } {
  const match = records.find((r) => r.projectId === projectId && r.periodKey === periodKey)
  return { paidOn: match?.paidOn ?? '', note: match?.note ?? '' }
}

export function buildMaintenanceHistoryByProject(
  projects: CrmProject[],
  records: CrmMaintenancePaymentRecord[],
  through: Date = new Date()
): MaintenanceProjectHistory[] {
  const maintainable = projects.filter((p) => p.maintenanceEnabled && p.maintenanceMonthlyAmount > 0)
  const throughMonth = { year: through.getFullYear(), monthIndex: through.getMonth() }
  const throughKey = monthKey(throughMonth.year, throughMonth.monthIndex)

  return maintainable
    .map((project) => {
      const start = maintenanceBillingStart(project)
      const months = eachMonthBetween(start, {
        year: throughMonth.year,
        monthIndex: throughMonth.monthIndex + 1,
      })

      const entries: MaintenanceProjectHistoryEntry[] = months.map(({ year, monthIndex }) => {
        const ledger = computeMaintenancePeriodLedger(project, year, monthIndex, records)
        const meta = recordMeta(project.id, ledger.periodKey, records)
        return {
          periodKey: ledger.periodKey,
          monthlyFee: ledger.monthlyFee,
          carryIn: ledger.carryIn,
          amountDue: ledger.amountDue,
          paidAmount: ledger.paidAmount,
          balance: ledger.balance,
          status: ledger.status,
          paidOn: meta.paidOn,
          note: meta.note,
        }
      })

      const totalCollected = entries.reduce((s, e) => s + e.paidAmount, 0)
      const totalBilled = entries.reduce((s, e) => s + e.amountDue, 0)
      const monthsPaid = entries.filter((e) => e.status === 'paid').length
      const monthsPartial = entries.filter((e) => e.status === 'partial').length
      const monthsUnpaid = entries.filter((e) => e.status === 'unpaid' && e.amountDue > 0).length
      const current = entries.find((e) => e.periodKey === throughKey)

      return {
        projectId: project.id,
        projectName: project.projectName,
        clientName: project.clientName || 'Client TBD',
        monthlyFee: project.maintenanceMonthlyAmount,
        totalCollected: Math.round(totalCollected * 100) / 100,
        totalBilled: Math.round(totalBilled * 100) / 100,
        monthsTracked: entries.length,
        monthsPaid,
        monthsPartial,
        monthsUnpaid,
        currentOutstanding: current?.balance ?? 0,
        entries: entries.reverse(),
      }
    })
    .sort((a, b) => {
      if (b.currentOutstanding !== a.currentOutstanding) return b.currentOutstanding - a.currentOutstanding
      return a.projectName.localeCompare(b.projectName)
    })
}
