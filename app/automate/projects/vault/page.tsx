'use client'

import AutomateShell from '@/components/automate/AutomateShell'
import ProjectsManager from '@/components/automate/ProjectsManager'

export default function AutomateProjectsVaultPage() {
  return (
    <AutomateShell title="Payments vault" subtitle="Business dashboard, contracts, and project records">
      <ProjectsManager />
    </AutomateShell>
  )
}
