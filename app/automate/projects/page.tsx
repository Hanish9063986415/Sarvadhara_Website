'use client'

import AutomateShell from '@/components/automate/AutomateShell'
import ProjectsHub from '@/components/automate/ProjectsHub'

export default function AutomateProjectsHubPage() {
  return (
    <AutomateShell title="Projects" subtitle="Track · maintenance · payments vault">
      <ProjectsHub />
    </AutomateShell>
  )
}
