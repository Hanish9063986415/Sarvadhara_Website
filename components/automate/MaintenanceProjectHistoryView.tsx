'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, CircleDollarSign } from 'lucide-react'
import {
  AUTOMATE_PROJECTS_MAINTENANCE_PATH,
  projectRecordPath,
} from '@/lib/automate-routes'
import { formatInr } from '@/lib/format-currency'
import MaintenanceProjectHistoryTable from '@/components/automate/MaintenanceProjectHistoryTable'
import type { MaintenanceProjectHistory } from '@/types/crm-maintenance-record'
import type { CrmProject } from '@/types/crm-project'

function projectInitial(name: string): string {
  const t = name.trim()
  if (!t) return '?'
  return t.slice(0, 1).toUpperCase()
}

export default function MaintenanceProjectHistoryView({ projectId }: { projectId: string }) {
  const searchParams = useSearchParams()
  const highlightPeriodKey = searchParams.get('period') ?? undefined

  const [project, setProject] = useState<CrmProject | null>(null)
  const [history, setHistory] = useState<MaintenanceProjectHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [entryFilter, setEntryFilter] = useState<'all' | 'with-payment'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const [projectRes, historyRes] = await Promise.all([
      fetch(`/api/automate/projects/${encodeURIComponent(projectId)}`),
      fetch(
        `/api/automate/maintenance-records?view=by-project&projectId=${encodeURIComponent(projectId)}`
      ),
    ])
    setLoading(false)
    if (projectRes.ok) {
      const data = (await projectRes.json()) as { project: CrmProject }
      setProject(data.project)
    } else {
      setProject(null)
    }
    if (historyRes.ok) {
      const data = (await historyRes.json()) as { byProject: MaintenanceProjectHistory[] }
      setHistory(data.byProject[0] ?? null)
    } else {
      setHistory(null)
    }
  }, [projectId])

  useEffect(() => {
    void load()
  }, [load])

  const visibleEntries = useMemo(() => {
    const entries = history?.entries ?? []
    if (entryFilter === 'with-payment') return entries.filter((e) => e.paidAmount > 0)
    return entries
  }, [history?.entries, entryFilter])

  const paidRatio =
    history && history.monthsTracked > 0 ? Math.round((history.monthsPaid / history.monthsTracked) * 100) : 0

  const title = project?.projectName ?? history?.projectName ?? 'Project'
  const client = project?.clientName || history?.clientName || 'Client TBD'

  return (
    <div className="automate-page-container space-y-6">
      <Link
        href={AUTOMATE_PROJECTS_MAINTENANCE_PATH}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-400 transition-colors hover:border-white/20 hover:text-platinum-metallic"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to maintenance
      </Link>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/[0.1] via-amber-500/[0.06] to-transparent">
        <div className="border-b border-white/10 px-5 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/25 to-amber-500/15 font-luxury text-3xl text-platinum-metallic">
                {projectInitial(title)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-platinum-500">Maintenance history</p>
                <h1 className="font-luxury mt-1 text-3xl text-platinum-metallic sm:text-4xl">{title}</h1>
                <p className="mt-1 text-sm text-platinum-500">{client}</p>
                {project ? (
                  <Link
                    href={projectRecordPath(project.id)}
                    className="mt-3 inline-block text-sm text-violet-200/90 underline-offset-2 hover:underline"
                  >
                    Open project record
                  </Link>
                ) : null}
              </div>
            </div>

            {!loading && history ? (
              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-2xl">
                <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/[0.1] px-4 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-platinum-600">Collected</p>
                  <p className="crm-stat-md mt-0.5 text-emerald-100">{formatInr(history.totalCollected)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-platinum-600">Paid months</p>
                  <p className="crm-stat-md mt-0.5 text-platinum-100">
                    {history.monthsPaid}
                    <span className="text-platinum-600"> / {history.monthsTracked}</span>
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-platinum-600">On-time</p>
                  <p className="crm-stat-md mt-0.5 text-platinum-100">{paidRatio}%</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-platinum-600">Outstanding</p>
                  <p
                    className={`crm-stat-md mt-0.5 ${
                      history.currentOutstanding > 0 ? 'text-red-100/90' : 'text-emerald-100'
                    }`}
                  >
                    {formatInr(history.currentOutstanding)}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2 text-sm text-platinum-500">
            <CircleDollarSign className="h-4 w-4 text-amber-200/80" />
            {loading ? (
              <span>Loading ledger…</span>
            ) : history ? (
              <span>
                Retainer {formatInr(history.monthlyFee)}/mo · Billed {formatInr(history.totalBilled)}
              </span>
            ) : (
              <span>No history available</span>
            )}
          </div>
          <div className="inline-flex rounded-xl border border-white/10 bg-black/30 p-0.5">
            <button
              type="button"
              onClick={() => setEntryFilter('all')}
              className={`rounded-lg px-4 py-2 text-[10px] uppercase tracking-wider ${
                entryFilter === 'all' ? 'bg-white/10 text-platinum-100' : 'text-platinum-500'
              }`}
            >
              All months
            </button>
            <button
              type="button"
              onClick={() => setEntryFilter('with-payment')}
              className={`rounded-lg px-4 py-2 text-[10px] uppercase tracking-wider ${
                entryFilter === 'with-payment' ? 'bg-emerald-500/20 text-emerald-100' : 'text-platinum-500'
              }`}
            >
              Paid only
            </button>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {loading ? (
            <p className="py-20 text-center text-sm text-platinum-500">Loading maintenance records…</p>
          ) : !history ? (
            <p className="py-20 text-center text-sm text-platinum-500">Could not load history for this project.</p>
          ) : (
            <>
              {history.currentOutstanding <= 0 ? (
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-[10px] uppercase tracking-wider text-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Account current
                </div>
              ) : null}
              <MaintenanceProjectHistoryTable entries={visibleEntries} highlightPeriodKey={highlightPeriodKey} />
            </>
          )}
        </div>
      </section>
    </div>
  )
}
