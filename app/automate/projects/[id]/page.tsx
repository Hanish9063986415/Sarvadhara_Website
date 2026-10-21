'use client'

import ProjectRecord from '@/components/automate/ProjectRecord'

export default function ProjectRecordPage({ params }: { params: { id: string } }) {
  return <ProjectRecord projectId={params.id} />
}
