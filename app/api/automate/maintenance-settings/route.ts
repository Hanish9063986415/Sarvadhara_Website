import { NextResponse } from 'next/server'
import { canAccessProjectWorkspaceData } from '@/lib/automate-projects-api-auth'
import { getMaintenanceSettings, updateMaintenanceSettings } from '@/lib/crm-maintenance-settings-store'
import { clampClearanceDay } from '@/types/crm-maintenance-settings'

export async function GET() {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }
  const settings = await getMaintenanceSettings()
  return NextResponse.json({ settings })
}

export async function PATCH(request: Request) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const clearanceDay = clampClearanceDay(Number(body?.clearanceDay))
  const settings = await updateMaintenanceSettings(clearanceDay)
  return NextResponse.json({ settings })
}
