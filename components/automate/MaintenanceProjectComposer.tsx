'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarClock, Check, ChevronDown, Link2, Plus, Sparkles, Trash2, X } from 'lucide-react'
import CrmConfirmDialog from '@/components/automate/CrmConfirmDialog'
import { projectRecordPath } from '@/lib/automate-routes'
import { crmProjectToInput } from '@/lib/crm-project-api-parse'
import ClientContactFields from '@/components/automate/ClientContactFields'
import { defaultCrmProjectFields, type CrmProject } from '@/types/crm-project'
import { formatInr } from '@/lib/format-currency'

const NEW_PROJECT_VALUE = '__new__'

type Draft = {
  key: string
  /** '' = not chosen, project id, or NEW_PROJECT_VALUE */
  projectPick: string
  projectName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  projectUrl: string
  maintenanceMonthlyAmount: string
  maintenanceBillingDay: string
}

function blankDraft(): Draft {
  return {
    key: crypto.randomUUID(),
    projectPick: '',
    projectName: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    projectUrl: '',
    maintenanceMonthlyAmount: '',
    maintenanceBillingDay: '1',
  }
}

function draftFromProject(p: CrmProject): Partial<Draft> {
  return {
    projectPick: p.id,
    projectName: p.projectName,
    clientName: p.clientName,
    clientEmail: p.clientEmail,
    clientPhone: p.clientPhone,
    clientAddress: p.clientAddress,
    projectUrl: p.projectUrl,
    maintenanceMonthlyAmount:
      p.maintenanceMonthlyAmount > 0 ? String(p.maintenanceMonthlyAmount) : '',
    maintenanceBillingDay: String(p.maintenanceBillingDay || 1),
  }
}

function isDraftReady(d: Draft): boolean {
  const amount = Number(d.maintenanceMonthlyAmount)
  if (!Number.isFinite(amount) || amount <= 0) return false
  if (d.projectPick === NEW_PROJECT_VALUE) return Boolean(d.projectName.trim())
  if (d.projectPick) return true
  return false
}

export default function MaintenanceProjectComposer({
  onCreated,
  projects,
}: {
  onCreated: () => void
  projects: CrmProject[]
}) {
  const [open, setOpen] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([blankDraft()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<CrmProject[]>([])
  const [draftToRemove, setDraftToRemove] = useState<Draft | null>(null)

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.projectName.localeCompare(b.projectName, 'en-IN')),
    [projects]
  )

  const ready = drafts.filter(isDraftReady)
  const previewTotal = ready.reduce((sum, d) => sum + (Number(d.maintenanceMonthlyAmount) || 0), 0)

  function updateDraft(key: string, patch: Partial<Draft>) {
    setDrafts((list) => list.map((d) => (d.key === key ? { ...d, ...patch } : d)))
  }

  function handleProjectPickChange(draftKey: string, value: string) {
    if (value === NEW_PROJECT_VALUE) {
      updateDraft(draftKey, {
        projectPick: NEW_PROJECT_VALUE,
        projectName: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        projectUrl: '',
        maintenanceMonthlyAmount: '',
        maintenanceBillingDay: '1',
      })
      return
    }
    if (!value) {
      updateDraft(draftKey, { ...blankDraft(), key: draftKey })
      return
    }
    const project = projects.find((p) => p.id === value)
    if (!project) return
    updateDraft(draftKey, { key: draftKey, ...draftFromProject(project) } as Draft)
  }

  function pickedElsewhere(projectId: string, currentKey: string): boolean {
    return drafts.some((d) => d.key !== currentKey && d.projectPick === projectId)
  }

  function draftHasContent(d: Draft): boolean {
    return Boolean(
      d.projectPick ||
        d.projectName.trim() ||
        d.clientName.trim() ||
        d.clientEmail.trim() ||
        d.clientPhone.trim() ||
        d.clientAddress.trim() ||
        d.projectUrl.trim() ||
        d.maintenanceMonthlyAmount.trim()
    )
  }

  function requestRemoveDraft(draft: Draft) {
    if (drafts.length <= 1) return
    if (draftHasContent(draft)) setDraftToRemove(draft)
    else setDrafts((list) => list.filter((d) => d.key !== draft.key))
  }

  function confirmRemoveDraft() {
    if (!draftToRemove) return
    setDrafts((list) => (list.length <= 1 ? list : list.filter((d) => d.key !== draftToRemove.key)))
    setDraftToRemove(null)
  }

  function openComposer() {
    setError(null)
    setOpen(true)
  }

  function closeComposer() {
    if (saving) return
    setOpen(false)
    setDrafts([blankDraft()])
    setError(null)
  }

  async function saveDraft(draft: Draft): Promise<CrmProject | null> {
    const maintenanceMonthlyAmount = Number(draft.maintenanceMonthlyAmount) || 0
    const maintenanceBillingDay = Math.min(28, Math.max(1, Number(draft.maintenanceBillingDay) || 1))

    if (draft.projectPick && draft.projectPick !== NEW_PROJECT_VALUE) {
      const existing = projects.find((p) => p.id === draft.projectPick)
      if (!existing) return null
      const res = await fetch(`/api/automate/projects/${existing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          crmProjectToInput({
            ...existing,
            clientName: draft.clientName.trim() || existing.clientName,
            clientEmail: draft.clientEmail.trim() || existing.clientEmail,
            clientPhone: draft.clientPhone.trim() || existing.clientPhone,
            clientAddress: draft.clientAddress.trim() || existing.clientAddress,
            projectUrl: draft.projectUrl.trim() || existing.projectUrl,
            maintenanceEnabled: true,
            maintenanceMonthlyAmount,
            maintenanceBillingDay,
          })
        ),
      })
      if (!res.ok) return null
      const data = (await res.json()) as { project: CrmProject }
      return data.project
    }

    const defaults = defaultCrmProjectFields()
    const res = await fetch('/api/automate/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName: draft.projectName.trim(),
        clientName: draft.clientName.trim(),
        clientEmail: draft.clientEmail.trim(),
        clientPhone: draft.clientPhone.trim(),
        clientAddress: draft.clientAddress.trim(),
        projectUrl: draft.projectUrl.trim(),
        status: 'active',
        notes: '',
        tasks: [],
        totalContractAmount: 0,
        firstTransactionAmount: 0,
        paymentsClearedAmount: 0,
        transactions: [],
        ...defaults,
        maintenanceEnabled: true,
        maintenanceMonthlyAmount,
        maintenanceBillingDay,
      }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { project: CrmProject }
    return data.project
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (ready.length === 0) {
      setError('Choose a project (or Other for new), and enter a monthly amount greater than zero.')
      return
    }
    setSaving(true)
    setError(null)
    const results = await Promise.all(ready.map((draft) => saveDraft(draft)))
    setSaving(false)
    const saved = results.filter((p): p is CrmProject => Boolean(p))
    if (saved.length !== ready.length) {
      setError(
        saved.length === 0
          ? 'Could not add the maintenance projects.'
          : `Added ${saved.length} of ${ready.length}. Review the remaining entries.`
      )
    }
    if (saved.length > 0) {
      setCreated(saved)
      setDrafts([blankDraft()])
      setOpen(false)
      onCreated()
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-amber-500/[0.06] via-transparent to-violet-500/[0.04]">
      {!open ? (
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/15">
              <CalendarClock className="h-6 w-6 text-amber-100" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-platinum-500">Retainer onboarding</p>
              <h2 className="font-luxury text-lg text-platinum-metallic sm:text-xl">Add a client to maintenance</h2>
              <p className="mt-0.5 text-xs text-platinum-500 sm:text-sm">
                Pick an existing project from the list or choose Other to create a new retainer.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openComposer}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-400/35 bg-gradient-to-r from-amber-500/20 to-amber-500/10 px-5 py-3 text-xs font-medium uppercase tracking-wider text-amber-50 shadow-sm transition-colors hover:border-amber-300/50 hover:from-amber-500/30"
          >
            <Plus className="h-4 w-4" />
            Create new
          </button>
        </div>
      ) : null}

      {created.length > 0 && !open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-emerald-400/20 bg-emerald-500/[0.06] px-5 py-4 sm:px-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-emerald-200">
              <Check className="h-4 w-4 shrink-0" />
              Added to maintenance schedule
            </div>
            <button
              type="button"
              onClick={() => setCreated([])}
              className="text-[10px] uppercase tracking-wider text-platinum-500 hover:text-platinum-300"
            >
              Dismiss
            </button>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {created.map((project) => (
              <li key={project.id}>
                <Link
                  href={projectRecordPath(project.id)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm hover:border-white/20"
                >
                  <span className="truncate text-platinum-200">{project.projectName}</span>
                  <span className="crm-stat-sm shrink-0 text-amber-100">{formatInr(project.maintenanceMonthlyAmount)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="composer-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10">
              <div className="border-b border-white/10 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/15">
                      <Sparkles className="h-6 w-6 text-amber-100" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-amber-200/80">New retainer</p>
                      <h2 className="font-luxury text-2xl text-platinum-metallic">Add to maintenance</h2>
                      <p className="mt-1 max-w-xl text-sm text-platinum-400">
                        Select a project you already track, or choose <span className="text-platinum-300">Other</span>{' '}
                        to create a brand-new one. Set retainer and billing below.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-right">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-platinum-500">Ready to add</p>
                      <p className="crm-stat text-2xl text-amber-100">{formatInr(previewTotal)}</p>
                      <p className="text-[11px] text-platinum-500">
                        per month · {ready.length} project{ready.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeComposer}
                      disabled={saving}
                      className="rounded-xl border border-white/10 p-2.5 text-platinum-500 transition-colors hover:bg-white/5 hover:text-platinum-200"
                      aria-label="Close create form"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-7">
                {drafts.map((draft, index) => {
                  const isExisting =
                    draft.projectPick && draft.projectPick !== NEW_PROJECT_VALUE && draft.projectPick !== ''
                  const isNew = draft.projectPick === NEW_PROJECT_VALUE
                  const linked = isExisting ? projects.find((p) => p.id === draft.projectPick) : null

                  return (
                    <motion.div
                      key={draft.key}
                      layout
                      className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-300/80" />
                          <span className="text-xs uppercase tracking-wider text-platinum-500">
                            Maintenance project {index + 1}
                          </span>
                          {linked?.maintenanceEnabled ? (
                            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-emerald-200/90">
                              On maintenance
                            </span>
                          ) : null}
                        </div>
                        {drafts.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => requestRemoveDraft(draft)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-platinum-500 transition-colors hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="crm-label" htmlFor={`maint-pick-${draft.key}`}>
                            Project
                          </label>
                          <div className="relative">
                            <select
                              id={`maint-pick-${draft.key}`}
                              className="crm-input appearance-none pr-10"
                              value={draft.projectPick}
                              onChange={(e) => handleProjectPickChange(draft.key, e.target.value)}
                              autoFocus={index === 0}
                            >
                              <option value="">Select existing project or Other…</option>
                              {sortedProjects.length > 0 ? (
                                <optgroup label="Existing projects">
                                  {sortedProjects.map((p) => {
                                    const taken = pickedElsewhere(p.id, draft.key)
                                    const maint =
                                      p.maintenanceEnabled && p.maintenanceMonthlyAmount > 0
                                        ? ` · ${formatInr(p.maintenanceMonthlyAmount)}/mo`
                                        : ''
                                    const client = p.clientName ? ` · ${p.clientName}` : ''
                                    return (
                                      <option key={p.id} value={p.id} disabled={taken}>
                                        {p.projectName}
                                        {client}
                                        {maint}
                                        {taken ? ' (already in this form)' : ''}
                                      </option>
                                    )
                                  })}
                                </optgroup>
                              ) : null}
                              <optgroup label="New">
                                <option value={NEW_PROJECT_VALUE}>Other — create new project</option>
                              </optgroup>
                            </select>
                            <ChevronDown
                              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-platinum-500"
                              aria-hidden
                            />
                          </div>
                          {isExisting && linked ? (
                            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-3 py-2">
                              <Link2 className="h-3.5 w-3.5 shrink-0 text-violet-200/80" />
                              <p className="min-w-0 flex-1 truncate text-xs text-platinum-300">
                                <span className="font-medium text-platinum-100">{linked.projectName}</span>
                                {linked.clientName ? (
                                  <span className="text-platinum-500"> · {linked.clientName}</span>
                                ) : null}
                              </p>
                              <Link
                                href={projectRecordPath(linked.id)}
                                className="shrink-0 text-[10px] uppercase tracking-wider text-violet-200/90 hover:text-violet-100"
                              >
                                Open record
                              </Link>
                            </div>
                          ) : null}
                        </div>

                        {isNew ? (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <label className="crm-label" htmlFor={`maint-name-${draft.key}`}>
                              New project name
                            </label>
                            <input
                              id={`maint-name-${draft.key}`}
                              className="crm-input"
                              value={draft.projectName}
                              onChange={(e) => updateDraft(draft.key, { projectName: e.target.value })}
                              placeholder="Client product or site"
                              required
                            />
                          </div>
                        ) : (
                          <div className="hidden lg:block lg:col-span-3" aria-hidden />
                        )}

                        <div>
                          <label className="crm-label">Monthly amount (₹)</label>
                          <input
                            type="number"
                            min={0}
                            className="crm-input tabular-nums"
                            value={draft.maintenanceMonthlyAmount}
                            onChange={(e) => updateDraft(draft.key, { maintenanceMonthlyAmount: e.target.value })}
                            placeholder="5000"
                            required
                            disabled={!draft.projectPick}
                          />
                        </div>
                        <div>
                          <label className="crm-label">Billing day</label>
                          <input
                            type="number"
                            min={1}
                            max={28}
                            className="crm-input tabular-nums"
                            value={draft.maintenanceBillingDay}
                            onChange={(e) => updateDraft(draft.key, { maintenanceBillingDay: e.target.value })}
                            disabled={!draft.projectPick}
                          />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-2">
                          <label className="crm-label">Live site (optional)</label>
                          <input
                            className="crm-input"
                            value={draft.projectUrl}
                            onChange={(e) => updateDraft(draft.key, { projectUrl: e.target.value })}
                            placeholder="https://"
                            disabled={!draft.projectPick}
                          />
                        </div>
                        <ClientContactFields
                          idPrefix={`maint-${draft.key}`}
                          values={{
                            clientName: draft.clientName,
                            clientEmail: draft.clientEmail,
                            clientPhone: draft.clientPhone,
                            clientAddress: draft.clientAddress,
                          }}
                          onChange={(patch) => updateDraft(draft.key, patch)}
                        />
                      </div>
                      {!draft.projectPick ? (
                        <p className="mt-3 text-xs text-platinum-600">
                          Start by choosing a project from the list, or select Other to name a new one.
                        </p>
                      ) : null}
                    </motion.div>
                  )
                })}

                {error && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setDrafts((list) => [...list, blankDraft()])}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-300 hover:text-platinum-metallic"
                  >
                    <Plus className="h-4 w-4" />
                    Add another retainer
                  </button>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={closeComposer}
                      disabled={saving}
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-400 hover:text-platinum-metallic"
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={saving || ready.length === 0} className="crm-primary-btn">
                      {saving
                        ? 'Adding…'
                        : ready.length === 1
                          ? 'Add 1 to maintenance'
                          : `Add ${ready.length} to maintenance`}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CrmConfirmDialog
        open={Boolean(draftToRemove)}
        title="Remove this retainer draft?"
        description={
          draftToRemove ? (
            <>
              Discards the draft for{' '}
              <span className="text-platinum-200">
                {draftToRemove.projectName.trim() ||
                  (draftToRemove.projectPick && draftToRemove.projectPick !== NEW_PROJECT_VALUE
                    ? projects.find((p) => p.id === draftToRemove.projectPick)?.projectName
                    : null) ||
                  `project ${drafts.findIndex((d) => d.key === draftToRemove.key) + 1}`}
              </span>
              . Other drafts in this form are unchanged.
            </>
          ) : null
        }
        confirmLabel="Remove draft"
        tone="warning"
        onClose={() => setDraftToRemove(null)}
        onConfirm={confirmRemoveDraft}
      />
    </section>
  )
}
