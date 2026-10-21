'use client'

import AutomateShell from '@/components/automate/AutomateShell'
import MaintenanceSchedule from '@/components/automate/MaintenanceSchedule'

export default function AutomateProjectsMaintenancePage() {
  return (
    <AutomateShell title="Maintenance" subtitle="Monthly billing, retainers, invoices, and per-project payment history">
      <MaintenanceSchedule />
    </AutomateShell>
  )
}
