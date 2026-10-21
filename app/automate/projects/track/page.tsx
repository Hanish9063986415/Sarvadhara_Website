'use client'

import AutomateShell from '@/components/automate/AutomateShell'
import ProjectsTrackBoard from '@/components/automate/ProjectsTrackBoard'

export default function AutomateProjectsTrackPage() {
  return (
    <AutomateShell title="Project track" subtitle="Progress, phase, and delivery status">
      <ProjectsTrackBoard />
    </AutomateShell>
  )
}
