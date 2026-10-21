'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { projectRecordPath } from '@/lib/automate-routes'
import { formatInr } from '@/lib/format-currency'
import { billingDateForMonth } from '@/lib/maintenance-schedule'
import type { CrmProject } from '@/types/crm-project'

export default function MaintenanceProjectCards({
  projects,
  year,
  monthIndex,
  savingId,
  onToggle,
  onUpdateAmount,
  onUpdateDay,
}: {
  projects: CrmProject[]
  year: number
  monthIndex: number
  savingId: string | null
  onToggle: (project: CrmProject, enabled: boolean) => void
  onUpdateAmount: (project: CrmProject, amount: number) => void
  onUpdateDay: (project: CrmProject, day: number) => void
}) {
  const active = projects.filter((p) => p.maintenanceEnabled)
  const inactive = projects.filter((p) => !p.maintenanceEnabled)

  return (
    <div className="space-y-8">
      {active.length > 0 && (
        <div>
          <h3 className="mb-4 text-[10px] uppercase tracking-[0.16em] text-platinum-500">On maintenance plan</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {active.map((project) => {
              const due = billingDateForMonth(year, monthIndex, project.maintenanceBillingDay)
              return (
                <article
                  key={project.id}
                  className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/[0.07] to-transparent p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={projectRecordPath(project.id)}
                        className="font-luxury text-lg text-platinum-metallic hover:text-white truncate block"
                      >
                        {project.projectName}
                      </Link>
                      <p className="text-xs text-platinum-500">{project.clientName || 'Client TBD'}</p>
                      {(project.clientPhone || project.clientEmail) && (
                        <p className="mt-0.5 text-[11px] text-platinum-600 truncate">
                          {[project.clientPhone, project.clientEmail].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <label className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-emerald-300">
                      <input
                        type="checkbox"
                        checked
                        disabled={savingId === project.id}
                        onChange={() => onToggle(project, false)}
                        className="h-4 w-4 accent-amber-400"
                      />
                      Active
                    </label>
                  </div>
                  <p className="mt-4 crm-stat text-2xl text-amber-100">
                    {formatInr(project.maintenanceMonthlyAmount)}
                    <span className="ml-1 text-xs font-sans text-platinum-500">/ mo</span>
                  </p>
                  <p className="mt-1 text-xs text-platinum-400">
                    Due {due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · day {project.maintenanceBillingDay}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div>
                      <label className="crm-label">Amount</label>
                      <input
                        key={`${project.id}-amt-${project.updatedAt}`}
                        type="number"
                        min={0}
                        defaultValue={project.maintenanceMonthlyAmount}
                        disabled={savingId === project.id}
                        className="crm-input tabular-nums"
                        onBlur={(e) => onUpdateAmount(project, Number(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="crm-label">Day</label>
                      <input
                        key={`${project.id}-day-${project.updatedAt}`}
                        type="number"
                        min={1}
                        max={28}
                        defaultValue={project.maintenanceBillingDay}
                        disabled={savingId === project.id}
                        className="crm-input tabular-nums"
                        onBlur={(e) => onUpdateDay(project, Number(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs text-platinum-500 hover:text-platinum-300"
                    >
                      Live site
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      )}

      {inactive.length > 0 && (
        <div>
          <h3 className="mb-4 text-[10px] uppercase tracking-[0.16em] text-platinum-500">Add existing project to maintenance</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inactive.map((project) => (
              <article
                key={project.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div className="min-w-0">
                  <Link href={projectRecordPath(project.id)} className="truncate text-sm text-platinum-200 hover:text-platinum-metallic">
                    {project.projectName}
                  </Link>
                  <p className="text-[11px] text-platinum-600">Not on a monthly plan</p>
                </div>
                <button
                  type="button"
                  disabled={savingId === project.id}
                  onClick={() => onToggle(project, true)}
                  className="shrink-0 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-amber-100 hover:bg-amber-500/15 disabled:opacity-50"
                >
                  Enable
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
