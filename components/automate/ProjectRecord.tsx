'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  Mail,
  Phone,
  Pencil,
  Trash2,
} from 'lucide-react'
import AutomateShell from '@/components/automate/AutomateShell'
import DeleteCrmProjectDialog, { deleteCrmProjectRequest } from '@/components/automate/DeleteCrmProjectDialog'
import ClientContactPanel from '@/components/automate/ClientContactPanel'
import ProjectDocumentsPanel from '@/components/automate/ProjectDocumentsPanel'
import ProjectNotesTasks from '@/components/automate/ProjectNotesTasks'
import {
  AUTOMATE_PROJECTS_TRACK_PATH,
  AUTOMATE_PROJECTS_VAULT_PATH,
} from '@/lib/automate-routes'
import { formatCrmDateTime } from '@/lib/crm-dates'
import { formatInr } from '@/lib/format-currency'
import { CRM_PROJECT_PHASES, phaseLabel, type CrmProject, type CrmProjectStatus } from '@/types/crm-project'

function statusLabel(status: CrmProjectStatus): string {
  if (status === 'on_hold') return 'On hold'
  if (status === 'completed') return 'Completed'
  return 'Active'
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c
  return (
    <div className="relative h-[132px] w-[132px] shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="66"
          cy="66"
          r={r}
          fill="none"
          stroke="url(#recordProgress)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="recordProgress" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#e5e4e2" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center crm-stat text-xl">
        {percent}%
      </span>
    </div>
  )
}

export default function ProjectRecord({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [project, setProject] = useState<CrmProject | null>(null)
  const [canDelete, setCanDelete] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/automate/projects/${projectId}`)
      if (cancelled) return
      if (res.status === 404) {
        setMissing(true)
        setLoading(false)
        return
      }
      if (!res.ok) {
        setError('Could not open this project.')
        setLoading(false)
        return
      }
      const data = (await res.json()) as { project: CrmProject; canDelete?: boolean }
      setProject(data.project)
      setCanDelete(Boolean(data.canDelete))
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  async function confirmDeleteProject() {
    if (!project) return
    setDeleting(true)
    setError(null)
    const result = await deleteCrmProjectRequest(project.id)
    setDeleting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setDeleteOpen(false)
    router.push(AUTOMATE_PROJECTS_TRACK_PATH)
  }

  const phaseIndex = project ? CRM_PROJECT_PHASES.findIndex((phase) => phase.id === project.deliveryPhase) : -1
  const collected =
    project && project.totalContractAmount > 0
      ? Math.min(100, Math.round((project.paymentsClearedAmount / project.totalContractAmount) * 100))
      : 0

  return (
    <AutomateShell title={project?.projectName ?? 'Project'} subtitle="Full project record">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href={AUTOMATE_PROJECTS_TRACK_PATH}
          className="inline-flex items-center gap-2 text-sm text-platinum-500 hover:text-platinum-metallic"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to project track
        </Link>

        {loading && <p className="py-20 text-center text-sm text-platinum-500">Opening project…</p>}
        {missing && <p className="py-20 text-center text-sm text-platinum-500">This project is no longer in the workspace.</p>}
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
        )}

        {project && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-white/[0.03] to-transparent">
              <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center">
                <ProgressRing percent={project.progressPercent} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-blue-100">
                      {statusLabel(project.status)}
                    </span>
                    <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-violet-100">
                      {phaseLabel(project.deliveryPhase)}
                    </span>
                    {project.allPaymentsCleared && (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-emerald-200">
                        Paid in full
                      </span>
                    )}
                    {(project.documents?.length ?? 0) > 0 && (
                      <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-emerald-100/90">
                        {project.documents!.length} on file
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 font-luxury text-4xl text-platinum-metallic">{project.projectName}</h2>
                  <p className="mt-2 text-platinum-400">{project.clientName || 'Client not set'}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-platinum-300/30 bg-platinum-metallic/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-metallic hover:bg-platinum-metallic/15"
                      >
                        Open live site
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {project.clientPhone?.trim() && (
                      <a
                        href={`tel:${project.clientPhone.replace(/\s/g, '')}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-300 hover:text-platinum-metallic"
                      >
                        <Phone className="h-4 w-4" />
                        Call client
                      </a>
                    )}
                    {project.clientEmail?.trim() && (
                      <a
                        href={`mailto:${project.clientEmail}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-300 hover:text-platinum-metallic"
                      >
                        <Mail className="h-4 w-4" />
                        Email client
                      </a>
                    )}
                    <Link
                      href={`${AUTOMATE_PROJECTS_VAULT_PATH}?edit=${project.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-300 hover:text-platinum-metallic"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit record
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {(project.transactions?.length ?? 0) > 0 && (
              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
                <h3 className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Payment transactions</h3>
                <ul className="mt-4 divide-y divide-white/[0.06]">
                  {project.transactions.map((txn) => (
                    <li key={txn.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0">
                      <div className="min-w-0">
                        <p className="font-medium text-platinum-200">{txn.label}</p>
                        {txn.paidOn && (
                          <p className="text-xs text-platinum-500">
                            {new Date(`${txn.paidOn}T12:00:00`).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                        {txn.note && <p className="mt-1 text-xs text-platinum-600">{txn.note}</p>}
                      </div>
                      <p className="crm-stat-md text-emerald-200">{formatInr(txn.amount)}</p>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`${AUTOMATE_PROJECTS_VAULT_PATH}?edit=${project.id}`}
                  className="mt-4 inline-flex text-xs uppercase tracking-wider text-platinum-500 hover:text-platinum-metallic"
                >
                  Edit payments in vault →
                </Link>
              </section>
            )}

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Contract', value: formatInr(project.totalContractAmount) },
                { label: 'Transactions', value: String(project.transactions?.length ?? 0) },
                { label: 'Payments cleared', value: formatInr(project.paymentsClearedAmount) },
                { label: 'Outstanding balance', value: formatInr(project.balance) },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">{item.label}</p>
                  <p className="mt-2 crm-stat text-2xl">{item.value}</p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between text-xs text-platinum-500">
                <span>Amount collected</span>
                <span className="crm-stat-sm">{collected}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-emerald-400/80" style={{ width: `${collected}%` }} />
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-5">
              <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 lg:col-span-3">
                <h3 className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Delivery path</h3>
                <ol className="mt-5 space-y-3">
                  {CRM_PROJECT_PHASES.map((phase, index) => {
                    const done = index < phaseIndex
                    const current = index === phaseIndex
                    return (
                      <li key={phase.id} className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${
                            current
                              ? 'border-violet-300/50 bg-violet-500/20 text-violet-100'
                              : done
                                ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                                : 'border-white/10 text-platinum-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className={current ? 'text-platinum-metallic' : 'text-platinum-400'}>{phase.label}</span>
                        {current && (
                          <span className="ml-auto text-[10px] uppercase tracking-wider text-violet-200">Current</span>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </section>

              <section className="space-y-6 lg:col-span-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
                  <h3 className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Live site</h3>
                  <p className="mt-3 break-all text-sm text-platinum-200">
                    {project.projectUrl ? (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 hover:text-platinum-metallic"
                      >
                        {project.projectUrl}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-platinum-500">No URL on file</span>
                    )}
                  </p>
                </div>

                <ClientContactPanel
                  clientName={project.clientName ?? ''}
                  clientEmail={project.clientEmail ?? ''}
                  clientPhone={project.clientPhone ?? ''}
                  clientAddress={project.clientAddress ?? ''}
                />

                <div className="rounded-2xl border border-amber-400/15 bg-amber-500/[0.05] p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-amber-100/80">
                    <CalendarClock className="h-4 w-4" />
                    Maintenance
                  </div>
                  <p className="mt-3 crm-stat text-2xl">
                    {project.maintenanceEnabled ? formatInr(project.maintenanceMonthlyAmount) : (
                      <span className="font-sans text-lg font-normal text-platinum-400">Not enabled</span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-platinum-400">
                    {project.maintenanceEnabled
                      ? `Billed on day ${project.maintenanceBillingDay} of each month`
                      : 'No monthly retainer on this project'}
                  </p>
                </div>
              </section>
            </div>

            <ProjectDocumentsPanel project={project} onSaved={setProject} />

            <ProjectNotesTasks project={project} onSaved={setProject} />

            <section className="flex flex-wrap items-center justify-between gap-3 text-xs text-platinum-500">
              <p>Created {formatCrmDateTime(project.createdAt)}</p>
              <p>Updated {formatCrmDateTime(project.updatedAt)}</p>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-400/25 px-3 py-2 text-[10px] uppercase tracking-wider text-red-200 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete project
                </button>
              )}
            </section>
          </motion.div>
        )}
      </div>

      <DeleteCrmProjectDialog
        open={deleteOpen}
        projectName={project?.projectName ?? ''}
        loading={deleting}
        onClose={() => !deleting && setDeleteOpen(false)}
        onConfirm={confirmDeleteProject}
      />
    </AutomateShell>
  )
}
