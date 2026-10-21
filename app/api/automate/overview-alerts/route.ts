import { NextResponse } from 'next/server'
import { canAccessProjectWorkspaceData } from '@/lib/automate-projects-api-auth'
import { buildAutomateOverviewAlerts } from '@/lib/automate-overview-alerts'
import { listCrmProjects } from '@/lib/crm-projects-store'
import { listMaintenancePaymentRecords } from '@/lib/crm-maintenance-records-store'
import { getMaintenanceSettings } from '@/lib/crm-maintenance-settings-store'
import { listMonthlyExpenses } from '@/lib/crm-monthly-expenses-store'

export async function GET() {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }

  const [projects, expenses, maintenanceRecords, settings] = await Promise.all([
    listCrmProjects(),
    listMonthlyExpenses(),
    listMaintenancePaymentRecords(),
    getMaintenanceSettings(),
  ])

  const payload = buildAutomateOverviewAlerts({
    projects,
    expenses,
    maintenanceRecords,
    clearanceDay: settings.clearanceDay,
  })

  return NextResponse.json(payload)
}
