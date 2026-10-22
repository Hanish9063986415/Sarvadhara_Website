'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ExternalLink, Filter, Plus, Trash2 } from 'lucide-react'
import DeleteCrmProjectDialog, { deleteCrmProjectRequest } from '@/components/automate/DeleteCrmProjectDialog'
import { useCrmProjects } from '@/components/automate/useCrmProjects'
import { AUTOMATE_PROJECTS_NEW_PATH, projectRecordPath } from '@/lib/automate-routes'
import { crmProjectToInput } from '@/lib/crm-project-api-parse'
import {
  CRM_PROJECT_PHASES,
  phaseLabel,
  taskMeterAverage,
  type CrmProject,
  type CrmProjectPhase,
  type CrmProjectStatus,
} from '@/types/crm-project'

function ProgressRing({ percent }: { percent: number }) {
  const r = 36
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c
  return (
    <div className="relative h-[88px] w-[88px] shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="url(#progressGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#e5e4e2" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center crm-stat-sm">
        {percent}%
      </span>
    </div>
  )
}

function statusTone(status: CrmProjectStatus): string {
  if (status === 'active') return 'text-blue-200 border-blue-400/30 bg-blue-500/10'
  if (status === 'on_hold') return 'text-amber-200 border-amber-400/30 bg-amber-500/10'
  return 'text-platinum-300 border-white/15 bg-white/5'
}

export default function ProjectsTrackBoard() {
  const { projects, loading, error, setError, reload, canDeleteProjects } = useCrmProjects()
  const [filter, setFilter] = useState<CrmProjectStatus | 'all'>('all')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function confirmDeleteProject() {
    if (!deleteTarget) return
    setDeleting(true)
    setError(null)
    const result = await deleteCrmProjectRequest(deleteTarget.id)
    setDeleting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setDeleteTarget(null)
    await reload()
  }

  const summary = useMemo(() => {
    const active = projects.filter((p) => p.status === 'active').length
    const onHold = projects.filter((p) => p.status === 'on_hold').length
    const completed = projects.filter((p) => p.status === 'completed').length
    const avg =
      projects.length === 0 ? 0 : Math.round(projects.reduce((s, p) => s + p.progressPercent, 0) / projects.length)
    return { active, onHold, completed, avg }
  }, [projects])

  const filtered = useMemo(() => {
    const list = filter === 'all' ? projects : projects.filter((p) => p.status === filter)
    return [...list].sort((a, b) => b.progressPercent - a.progressPercent)
  }, [projects, filter])

  async function patchProject(project: CrmProject, patch: Partial<CrmProject>) {
    setSavingId(project.id)
    setError(null)
    const payload = crmProjectToInput({ ...project, ...patch })
    const res = await fetch(`/api/automate/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSavingId(null)
    if (!res.ok) {
      setError('Could not save progress.')
      return
    }
    await reload()
  }

  return (
    <div className="automate-page-container space-y-6">
      <p className="text-sm text-platinum-400 max-w-2xl">
        Monitor delivery health — update phase and progress inline. Available after your Automate sign-in.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Avg. progress', value: `${summary.avg}%` },
          { label: 'Active', value: String(summary.active) },
          { label: 'On hold', value: String(summary.onHold) },
          { label: 'Completed', value: String(summary.completed) },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-violet-400/15 bg-violet-500/[0.06] px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-platinum-500">{c.label}</p>
            <p className="mt-1 crm-stat-md">{loading ? '…' : c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={AUTOMATE_PROJECTS_NEW_PATH}
          className="inline-flex items-center gap-2 rounded-full border border-platinum-300/30 bg-platinum-metallic/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-platinum-metallic hover:bg-platinum-metallic/15"
        >
          <Plus className="h-3.5 w-3.5" />
          New projects
        </Link>
        <Filter className="w-4 h-4 text-platinum-600" />
        {(['all', 'active', 'on_hold', 'completed'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider border transition-colors ${
              filter === key
                ? 'border-violet-400/40 bg-violet-500/15 text-violet-100'
                : 'border-white/10 text-platinum-500 hover:text-platinum-metallic'
            }`}
          >
            {key.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      )}

      {loading ? (
        <p className="text-center text-platinum-500 py-16 text-sm">Loading track board…</p>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-platinum-500">No projects match this filter.</p>
          <Link
            href={AUTOMATE_PROJECTS_NEW_PATH}
            className="mt-4 inline-flex items-center gap-2 text-sm text-platinum-metallic hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Create projects
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              role="link"
              tabIndex={0}
              onClick={(event) => {
                const target = event.target as HTMLElement
                if (target.closest('a, button, input, select, label')) return
                router.push(projectRecordPath(p.id))
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') router.push(projectRecordPath(p.id))
              }}
              className="cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5 sm:p-6 transition-colors hover:border-white/25 hover:bg-white/[0.04]"
            >
              <div className="flex gap-4">
                <ProgressRing percent={p.progressPercent} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-luxury text-lg text-platinum-metallic truncate">{p.projectName}</h3>
                      <p className="text-sm text-platinum-500">{p.clientName || 'Client TBD'}</p>
                      {(p.clientPhone || p.clientEmail) && (
                        <p className="mt-0.5 text-xs text-platinum-600 truncate">
                          {[p.clientPhone, p.clientEmail].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${statusTone(p.status)}`}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                      {canDeleteProjects ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget({ id: p.id, name: p.projectName })
                          }}
                          className="rounded-lg p-1.5 text-platinum-500 hover:bg-red-500/10 hover:text-red-300"
                          aria-label={`Delete ${p.projectName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {p.projectUrl && (
                      <a
                        href={p.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-platinum-500 hover:text-platinum-300"
                      >
                        Live site
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {(p.documents?.length ?? 0) > 0 && (
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400/80">
                        {p.documents!.length} signed doc{p.documents!.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="crm-label">Delivery phase</label>
                  <select
                    className="crm-input"
                    value={p.deliveryPhase}
                    disabled={savingId === p.id}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      patchProject(p, { deliveryPhase: e.target.value as CrmProjectPhase })
                    }
                  >
                    {CRM_PROJECT_PHASES.map((ph) => (
                      <option key={ph.id} value={ph.id}>
                        {ph.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-platinum-600">{phaseLabel(p.deliveryPhase)}</p>
                </div>
                <div>
                  <label className="crm-label">Progress — {p.progressPercent}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={p.progressPercent}
                    key={`${p.id}-prog-${p.updatedAt}`}
                    disabled={savingId === p.id}
                    onClick={(e) => e.stopPropagation()}
                    onPointerUp={(e) =>
                      patchProject(p, { progressPercent: Number((e.target as HTMLInputElement).value) })
                    }
                    onChange={(e) => {
                      const label = e.target.previousElementSibling
                      if (label) label.textContent = `Progress — ${e.target.value}%`
                    }}
                    className="mt-2 w-full accent-violet-400"
                  />
                </div>
              </div>

              <div className="mt-4 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500/80 to-platinum-metallic/70 transition-all duration-500"
                  style={{ width: `${p.progressPercent}%` }}
                />
              </div>

              {(p.tasks?.length > 0 || p.notes) && (
                <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
                  {p.tasks?.length > 0 && (
                    <p className="text-[11px] uppercase tracking-wider text-violet-200/80">
                      Task meter {taskMeterAverage(p.tasks)}% · {p.tasks.length} task{p.tasks.length === 1 ? '' : 's'}
                    </p>
                  )}
                  {p.notes && <p className="text-xs text-platinum-500 line-clamp-2">{p.notes}</p>}
                </div>
              )}
              {savingId === p.id && (
                <p className="mt-2 text-[10px] uppercase tracking-wider text-violet-300/80">Saving…</p>
              )}
            </motion.article>
          ))}
        </div>
      )}

      <DeleteCrmProjectDialog
        open={Boolean(deleteTarget)}
        projectName={deleteTarget?.name ?? ''}
        loading={deleting}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={confirmDeleteProject}
      />
    </div>
  )
}
