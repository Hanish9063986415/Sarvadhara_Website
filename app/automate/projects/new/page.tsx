'use client'

import AutomateShell from '@/components/automate/AutomateShell'
import CreateProjectsComposer from '@/components/automate/CreateProjectsComposer'

export default function NewProjectsPage() {
  return (
    <AutomateShell title="New projects" subtitle="Create one project or several at once">
      <CreateProjectsComposer />
    </AutomateShell>
  )
}
