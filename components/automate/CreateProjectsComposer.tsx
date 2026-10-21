'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Plus, Trash2 } from 'lucide-react'
import { projectRecordPath } from '@/lib/automate-routes'
import ClientContactFields from '@/components/automate/ClientContactFields'
import { defaultCrmProjectFields, type CrmProject, type CrmProjectStatus } from '@/types/crm-project'

type Draft = {
  key: string
  projectName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  projectUrl: string
  status: CrmProjectStatus
  notes: string
}

function blankDraft(): Draft {
  return {
    key: crypto.randomUUID(),
    projectName: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    projectUrl: '',
    status: 'active',
    notes: '',
  }
}

function draftIsEmpty(draft: Draft): boolean {
  return (
    !draft.projectName.trim() &&
    !draft.clientName.trim() &&
    !draft.clientEmail.trim() &&
    !draft.clientPhone.trim() &&
    !draft.clientAddress.trim() &&
    !draft.projectUrl.trim() &&
    !draft.notes.trim()
  )
}

export default function CreateProjectsComposer() {
  const [drafts, setDrafts] = useState<Draft[]>([blankDraft(), blankDraft()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<CrmProject[]>([])

  const readyCount = drafts.filter((draft) => draft.projectName.trim()).length

  function updateDraft(key: string, patch: Partial<Draft>) {
    setDrafts((list) => list.map((draft) => (draft.key === key ? { ...draft, ...patch } : draft)))
  }

  function removeDraft(key: string) {
    setDrafts((list) => (list.length === 1 ? [blankDraft()] : list.filter((draft) => draft.key !== key)))
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    const ready = drafts.filter((draft) => draft.projectName.trim())
    if (ready.length === 0) {
      setError('Add a name to at least one project.')
      return
    }
    setSaving(true)
    setError(null)
    const defaults = defaultCrmProjectFields()
    const results = await Promise.all(
      ready.map(async (draft) => {
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
            status: draft.status,
            notes: draft.notes,
            tasks: [],
            totalContractAmount: 0,
            firstTransactionAmount: 0,
            paymentsClearedAmount: 0,
            transactions: [],
            ...defaults,
          }),
        })
        if (!res.ok) return null
        const data = (await res.json()) as { project: CrmProject }
        return data.project
      })
    )
    setSaving(false)
    const projects = results.filter((project): project is CrmProject => Boolean(project))
    if (projects.length !== ready.length) {
      setError(
        projects.length === 0
          ? 'Could not create the projects.'
          : `Created ${projects.length} of ${ready.length}. Check the names and try the rest again.`
      )
    }
    if (projects.length > 0) {
      setCreated(projects)
      setDrafts([blankDraft(), blankDraft()])
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-xl text-sm leading-relaxed text-platinum-400">
          Line up as many projects as you need. A name is enough to create one. Client, site, and notes can be filled now or later on the project page.
        </p>
        <p className="crm-stat-lg">{readyCount}</p>
      </div>

      {created.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.06] p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 text-emerald-200">
            <Check className="h-4 w-4" />
            <h2 className="text-sm uppercase tracking-[0.14em]">
              {created.length} project{created.length === 1 ? '' : 's'} created
            </h2>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {created.map((project) => (
              <li key={project.id}>
                <Link
                  href={projectRecordPath(project.id)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-platinum-200 hover:border-white/20 hover:text-platinum-metallic"
                >
                  <span className="truncate">{project.projectName}</span>
                  <span className="text-[10px] uppercase tracking-wider text-platinum-500">Open</span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      <form onSubmit={handleCreate} className="space-y-4">
        {drafts.map((draft, index) => (
          <motion.section
            key={draft.key}
            layout
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-xs text-violet-100">
                  {index + 1}
                </span>
                <h2 className="font-luxury text-lg text-platinum-metallic">
                  {draft.projectName.trim() || `Project ${index + 1}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => removeDraft(draft.key)}
                className="rounded-lg p-2 text-platinum-500 hover:bg-white/5 hover:text-red-300"
                aria-label={`Remove project ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="crm-label" htmlFor={`${draft.key}-name`}>
                  Project name
                </label>
                <input
                  id={`${draft.key}-name`}
                  className="crm-input"
                  value={draft.projectName}
                  onChange={(event) => updateDraft(draft.key, { projectName: event.target.value })}
                  placeholder="Engagement or product name"
                />
              </div>
              <ClientContactFields
                idPrefix={draft.key}
                values={{
                  clientName: draft.clientName,
                  clientEmail: draft.clientEmail,
                  clientPhone: draft.clientPhone,
                  clientAddress: draft.clientAddress,
                }}
                onChange={(patch) => updateDraft(draft.key, patch)}
              />
              <div>
                <label className="crm-label" htmlFor={`${draft.key}-url`}>
                  Live site
                </label>
                <input
                  id={`${draft.key}-url`}
                  className="crm-input"
                  value={draft.projectUrl}
                  onChange={(event) => updateDraft(draft.key, { projectUrl: event.target.value })}
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="crm-label" htmlFor={`${draft.key}-status`}>
                  Status
                </label>
                <select
                  id={`${draft.key}-status`}
                  className="crm-input"
                  value={draft.status}
                  onChange={(event) => updateDraft(draft.key, { status: event.target.value as CrmProjectStatus })}
                >
                  <option value="active">Active</option>
                  <option value="on_hold">On hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="crm-label" htmlFor={`${draft.key}-notes`}>
                  Opening notes
                </label>
                <textarea
                  id={`${draft.key}-notes`}
                  rows={3}
                  className="crm-input resize-y whitespace-pre-wrap leading-relaxed"
                  value={draft.notes}
                  onChange={(event) => updateDraft(draft.key, { notes: event.target.value })}
                  placeholder="Paste a short brief if you already have one"
                />
              </div>
            </div>
            {draftIsEmpty(draft) && index > 0 && (
              <p className="mt-3 text-[11px] text-platinum-600">Leave this blank if you do not need another project.</p>
            )}
          </motion.section>
        ))}

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
            Add another project
          </button>
          <button type="submit" disabled={saving || readyCount === 0} className="crm-primary-btn">
            {saving ? 'Creating…' : readyCount === 1 ? 'Create 1 project' : `Create ${readyCount} projects`}
          </button>
        </div>
      </form>
    </div>
  )
}
