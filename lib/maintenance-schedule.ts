import { formatCrmDate, formatCrmMonthYear, isoFromLocalDate } from '@/lib/crm-dates'
import type { CrmProject } from '@/types/crm-project'

export function monthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

export function parseMonthKey(key: string): { year: number; monthIndex: number } {
  const [y, m] = key.split('-').map(Number)
  const year = y || new Date().getFullYear()
  const monthIndex = m ? m - 1 : new Date().getMonth()
  return { year, monthIndex: Math.min(11, Math.max(0, monthIndex)) }
}

export function formatMonthLabel(year: number, monthIndex: number): string {
  return formatCrmMonthYear(year, monthIndex)
}

export function billingDateForMonth(
  year: number,
  monthIndex: number,
  billingDay: number
): Date {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  const day = Math.min(billingDay, lastDay)
  return new Date(year, monthIndex, day)
}

/** Company-wide date by which maintenance for the month should be cleared */
export function clearanceDateForMonth(year: number, monthIndex: number, clearanceDay: number): Date {
  return billingDateForMonth(year, monthIndex, clearanceDay)
}

export function formatClearanceLabel(date: Date): string {
  return formatCrmDate(isoFromLocalDate(date))
}

export function maintenanceProjectsForMonth(projects: CrmProject[]) {
  return projects.filter((p) => p.maintenanceEnabled && p.maintenanceMonthlyAmount > 0)
}

export function totalMaintenanceDue(projects: CrmProject[]): number {
  return maintenanceProjectsForMonth(projects).reduce((sum, p) => sum + p.maintenanceMonthlyAmount, 0)
}

export function rollingMonths(count: number, anchor = new Date()): { year: number; monthIndex: number }[] {
  const items: { year: number; monthIndex: number }[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() + i, 1)
    items.push({ year: d.getFullYear(), monthIndex: d.getMonth() })
  }
  return items
}
