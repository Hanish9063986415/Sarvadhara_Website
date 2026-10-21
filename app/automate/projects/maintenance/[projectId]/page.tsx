'use client'

import { Suspense } from 'react'
import AutomateShell from '@/components/automate/AutomateShell'
import MaintenanceProjectHistoryView from '@/components/automate/MaintenanceProjectHistoryView'

export default function MaintenanceProjectHistoryPage({ params }: { params: { projectId: string } }) {
  return (
    <AutomateShell title="Maintenance history" subtitle="Full payment ledger for this project">
      <Suspense
        fallback={<p className="py-20 text-center text-sm text-platinum-500">Loading maintenance history…</p>}
      >
        <MaintenanceProjectHistoryView projectId={params.projectId} />
      </Suspense>
    </AutomateShell>
  )
}
