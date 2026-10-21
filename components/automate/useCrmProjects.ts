'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CrmProject } from '@/types/crm-project'

export function useCrmProjects() {
  const [projects, setProjects] = useState<CrmProject[]>([])
  const [canDeleteProjects, setCanDeleteProjects] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    setError(null)
    const res = await fetch('/api/automate/projects')
    if (!res.ok) {
      setError('Could not load projects.')
      setLoading(false)
      return
    }
    const data = (await res.json()) as { projects: CrmProject[]; canDelete?: boolean }
    setProjects(data.projects)
    setCanDeleteProjects(Boolean(data.canDelete))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return { projects, loading, error, setError, reload: loadProjects, canDeleteProjects }
}
