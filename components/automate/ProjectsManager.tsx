'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2, Pencil, Plus, Shield, Trash2, X } from 'lucide-react'
import type {
  CrmPaymentTransaction,
  CrmProject,
  CrmProjectPhase,
  CrmProjectStatus,
  CrmTask,
} from '@/types/crm-project'
import ProjectPaymentTransactions from '@/components/automate/ProjectPaymentTransactions'
import ClientContactFields from '@/components/automate/ClientContactFields'
import { CRM_PROJECT_PHASES } from '@/types/crm-project'
import CeoVaultLockButton from '@/components/automate/CeoVaultLockButton'
import VaultDashboard from '@/components/automate/VaultDashboard'
import {
  AUTOMATE_PROJECTS_LOGIN_PATH,
  AUTOMATE_PROJECTS_VAULT_PATH,
  projectRecordPath,
} from '@/lib/automate-routes'
import { financialsFromTransactions } from '@/types/crm-project'
import { formatInr } from '@/lib/format-currency'

type FormState = {
  projectName: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  projectUrl: string
  totalContractAmount: string
  transactions: CrmPaymentTransaction[]
  status: CrmProjectStatus
  notes: string
  tasks: CrmTask[]
  progressPercent: string
  deliveryPhase: CrmProjectPhase
  maintenanceEnabled: boolean
  maintenanceMonthlyAmount: string
  maintenanceBillingDay: string
}

const emptyForm = (): FormState => ({
  projectName: '',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientAddress: '',
  projectUrl: '',
  totalContractAmount: '0',
  transactions: [],
  status: 'active',
  notes: '',
  tasks: [],
  progressPercent: '0',
  deliveryPhase: 'discovery',
  maintenanceEnabled: false,
  maintenanceMonthlyAmount: '0',
  maintenanceBillingDay: '1',
})

function projectToForm(p: CrmProject): FormState {
  return {
    projectName: p.projectName,
    clientName: p.clientName,
    clientEmail: p.clientEmail,
    clientPhone: p.clientPhone ?? '',
    clientAddress: p.clientAddress ?? '',
    projectUrl: p.projectUrl,
    totalContractAmount: String(p.totalContractAmount),
    transactions: p.transactions ?? [],
    status: p.status,
    notes: p.notes,
    tasks: p.tasks ?? [],
    progressPercent: String(p.progressPercent),
    deliveryPhase: p.deliveryPhase,
    maintenanceEnabled: p.maintenanceEnabled,
    maintenanceMonthlyAmount: String(p.maintenanceMonthlyAmount),
    maintenanceBillingDay: String(p.maintenanceBillingDay),
  }
}

function formToPayload(form: FormState) {
  const totalContractAmount = Number(form.totalContractAmount) || 0
  const transactions = form.transactions.filter((txn) => txn.label.trim() && txn.amount > 0)
  const synced = financialsFromTransactions(totalContractAmount, transactions)
  return {
    projectName: form.projectName,
    clientName: form.clientName,
    clientEmail: form.clientEmail,
    clientPhone: form.clientPhone,
    clientAddress: form.clientAddress,
    projectUrl: form.projectUrl,
    totalContractAmount,
    firstTransactionAmount: synced.firstTransactionAmount,
    paymentsClearedAmount: synced.paymentsClearedAmount,
    transactions,
    status: form.status,
    notes: form.notes,
    tasks: form.tasks,
    progressPercent: Number(form.progressPercent) || 0,
    deliveryPhase: form.deliveryPhase,
    maintenanceEnabled: form.maintenanceEnabled,
    maintenanceMonthlyAmount: Number(form.maintenanceMonthlyAmount) || 0,
    maintenanceBillingDay: Number(form.maintenanceBillingDay) || 1,
  }
}

function StatusBadge({ status, cleared }: { status: CrmProjectStatus; cleared: boolean }) {
  if (cleared) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-300">
        <CheckCircle2 className="w-3 h-3" />
        Paid
      </span>
    )
  }
  const styles: Record<CrmProjectStatus, string> = {
    active: 'border-blue-400/30 bg-blue-500/10 text-blue-200',
    completed: 'border-platinum-400/30 bg-white/5 text-platinum-300',
    on_hold: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
  }
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${styles[status]}`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}

function ProjectFormFields({
  form,
  setForm,
  idPrefix,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  idPrefix: string
}) {
  const preview = financialsFromTransactions(
    Number(form.totalContractAmount) || 0,
    form.transactions.filter((txn) => txn.label.trim() && txn.amount > 0)
  )

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="crm-label" htmlFor={`${idPrefix}-name`}>
          Project name
        </label>
        <input
          id={`${idPrefix}-name`}
          className="crm-input"
          value={form.projectName}
          onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
          required
        />
      </div>
      <ClientContactFields
        idPrefix={idPrefix}
        values={{
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          clientPhone: form.clientPhone,
          clientAddress: form.clientAddress,
        }}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
      />
      <div className="sm:col-span-2">
        <label className="crm-label" htmlFor={`${idPrefix}-url`}>
          Project URL
        </label>
        <input
          id={`${idPrefix}-url`}
          className="crm-input"
          value={form.projectUrl}
          onChange={(e) => setForm((f) => ({ ...f, projectUrl: e.target.value }))}
          placeholder="https://"
        />
      </div>
      <div>
        <label className="crm-label" htmlFor={`${idPrefix}-total`}>
          Total contract (₹)
        </label>
        <input
          id={`${idPrefix}-total`}
          type="number"
          min={0}
          className="crm-input"
          value={form.totalContractAmount}
          onChange={(e) => setForm((f) => ({ ...f, totalContractAmount: e.target.value }))}
        />
      </div>
      <ProjectPaymentTransactions
        idPrefix={idPrefix}
        totalContractAmount={Number(form.totalContractAmount) || 0}
        transactions={form.transactions}
        onChange={(transactions) => setForm((f) => ({ ...f, transactions }))}
      />
      <div>
        <label className="crm-label" htmlFor={`${idPrefix}-status`}>
          Status
        </label>
        <select
          id={`${idPrefix}-status`}
          className="crm-input"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CrmProjectStatus }))}
        >
          <option value="active">Active</option>
          <option value="on_hold">On hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
        <span className="text-platinum-500">Balance (auto): </span>
        <span className="crm-stat-sm">{formatInr(preview.balance)}</span>
        {preview.allPaymentsCleared && preview.balance === 0 && (
          <span className="ml-2 text-emerald-300 text-xs">· All payments cleared</span>
        )}
      </div>
      <div className="sm:col-span-2">
        <label className="crm-label" htmlFor={`${idPrefix}-notes`}>
          Notes
        </label>
        <textarea
          id={`${idPrefix}-notes`}
          rows={8}
          className="crm-input resize-y whitespace-pre-wrap leading-relaxed"
          value={form.notes}
          placeholder="Paste briefs, meeting notes, or any text"
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>
      <div>
        <label className="crm-label" htmlFor={`${idPrefix}-phase`}>
          Delivery phase
        </label>
        <select
          id={`${idPrefix}-phase`}
          className="crm-input"
          value={form.deliveryPhase}
          onChange={(e) => setForm((f) => ({ ...f, deliveryPhase: e.target.value as CrmProjectPhase }))}
        >
          {CRM_PROJECT_PHASES.map((ph) => (
            <option key={ph.id} value={ph.id}>
              {ph.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="crm-label" htmlFor={`${idPrefix}-progress`}>
          Progress ({form.progressPercent}%)
        </label>
        <input
          id={`${idPrefix}-progress`}
          type="range"
          min={0}
          max={100}
          value={form.progressPercent}
          onChange={(e) => setForm((f) => ({ ...f, progressPercent: e.target.value }))}
          className="w-full accent-violet-400"
        />
      </div>
      <div className="sm:col-span-2 rounded-xl border border-amber-400/15 bg-amber-500/[0.04] p-4 space-y-3">
        <label className="inline-flex items-center gap-2 text-sm text-platinum-300">
          <input
            type="checkbox"
            checked={form.maintenanceEnabled}
            onChange={(e) => setForm((f) => ({ ...f, maintenanceEnabled: e.target.checked }))}
            className="h-4 w-4 accent-amber-400"
          />
          Monthly maintenance plan
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="crm-label" htmlFor={`${idPrefix}-maint-amt`}>
              Monthly amount (INR)
            </label>
            <input
              id={`${idPrefix}-maint-amt`}
              type="number"
              min={0}
              className="crm-input"
              disabled={!form.maintenanceEnabled}
              value={form.maintenanceMonthlyAmount}
              onChange={(e) => setForm((f) => ({ ...f, maintenanceMonthlyAmount: e.target.value }))}
            />
          </div>
          <div>
            <label className="crm-label" htmlFor={`${idPrefix}-maint-day`}>
              Billing day (1–28)
            </label>
            <input
              id={`${idPrefix}-maint-day`}
              type="number"
              min={1}
              max={28}
              className="crm-input"
              disabled={!form.maintenanceEnabled}
              value={form.maintenanceBillingDay}
              onChange={(e) => setForm((f) => ({ ...f, maintenanceBillingDay: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProjectsManager() {
  const router = useRouter()
  const editOpened = useRef(false)
  const [projects, setProjects] = useState<CrmProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [canDelete, setCanDelete] = useState(false)

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
    setCanDelete(Boolean(data.canDelete))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  useEffect(() => {
    if (loading || editOpened.current) return
    const editId = new URLSearchParams(window.location.search).get('edit')
    if (!editId) return
    const project = projects.find((item) => item.id === editId)
    if (!project) return
    editOpened.current = true
    startEdit(project)
  }, [loading, projects])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const res = await fetch('/api/automate/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formToPayload(addForm)),
    })
    setSaving(false)
    if (!res.ok) {
      setError('Failed to add project.')
      return
    }
    setAddForm(emptyForm())
    setShowAdd(false)
    await loadProjects()
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/automate/projects/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formToPayload(editForm)),
    })
    setSaving(false)
    if (!res.ok) {
      setError('Failed to update project.')
      return
    }
    setEditingId(null)
    await loadProjects()
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete project “${name}”?`)) return
    const res = await fetch(`/api/automate/projects/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setError(data.error ?? 'Failed to delete project.')
      return
    }
    if (editingId === id) setEditingId(null)
    await loadProjects()
  }

  function startEdit(p: CrmProject) {
    setEditingId(p.id)
    setEditForm(projectToForm(p))
    setShowAdd(false)
  }

  return (
    <div className="automate-page-container space-y-6">
      <VaultDashboard projects={projects} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-platinum-400">
          Add and edit projects with your Automate login. Deleting a project needs the admin login.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {canDelete ? (
            <CeoVaultLockButton />
          ) : (
            <Link
              href={`${AUTOMATE_PROJECTS_LOGIN_PATH}?next=${encodeURIComponent(AUTOMATE_PROJECTS_VAULT_PATH)}`}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-2.5 text-xs uppercase tracking-wider text-amber-100 hover:bg-amber-500/15 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Admin login to delete
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setShowAdd((v) => !v)
              setEditingId(null)
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-platinum-300/30 bg-platinum-metallic/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-metallic hover:bg-platinum-metallic/15 transition-colors"
          >
            {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdd ? 'Close' : 'Add project'}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      )}

      {showAdd && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 space-y-4"
        >
          <h2 className="font-luxury text-lg text-platinum-metallic">New project</h2>
          <ProjectFormFields form={addForm} setForm={setAddForm} idPrefix="add" />
          <button type="submit" disabled={saving} className="crm-primary-btn">
            {saving ? 'Saving…' : 'Save project'}
          </button>
        </motion.form>
      )}

      {editingId && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleUpdate}
          className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.04] p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-luxury text-lg text-platinum-metallic">Edit project</h2>
            <button type="button" onClick={() => setEditingId(null)} className="text-platinum-500 hover:text-platinum-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <ProjectFormFields form={editForm} setForm={setEditForm} idPrefix="edit" />
          <button type="submit" disabled={saving} className="crm-primary-btn">
            {saving ? 'Updating…' : 'Update project'}
          </button>
        </motion.form>
      )}

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-platinum-500 text-sm">Loading projects…</p>
        ) : projects.length === 0 ? (
          <p className="p-8 text-center text-platinum-500 text-sm">No projects yet. Add your first project above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-[0.12em] text-platinum-500">
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium text-right">Contract</th>
                  <th className="px-4 py-3 font-medium text-right">Transactions</th>
                  <th className="px-4 py-3 font-medium text-right">Cleared</th>
                  <th className="px-4 py-3 font-medium text-right">Balance</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => router.push(projectRecordPath(p.id))}
                    className="cursor-pointer border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-platinum-200">{p.projectName}</p>
                      {p.projectUrl && (
                        <a
                          href={p.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-platinum-500 hover:text-platinum-300 truncate block max-w-[180px]"
                        >
                          {p.projectUrl.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-platinum-400">
                      <p>{p.clientName || '—'}</p>
                      {p.clientPhone && <p className="text-xs text-platinum-500">{p.clientPhone}</p>}
                      {p.clientEmail && <p className="text-xs text-platinum-600 truncate max-w-[160px]">{p.clientEmail}</p>}
                    </td>
                    <td className="px-4 py-3 text-right crm-stat-sm text-platinum-200">
                      {formatInr(p.totalContractAmount)}
                    </td>
                    <td className="px-4 py-3 text-right crm-stat-sm text-platinum-300">
                      <span className="block">{p.transactions?.length ?? 0}</span>
                      <span className="text-[10px] text-platinum-600">payments</span>
                    </td>
                    <td className="px-4 py-3 text-right crm-stat-sm text-emerald-200/90">
                      {formatInr(p.paymentsClearedAmount)}
                    </td>
                    <td className="px-4 py-3 text-right crm-stat-sm">
                      <span className={p.balance > 0 ? 'text-amber-200' : 'text-platinum-400'}>
                        {formatInr(p.balance)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} cleared={p.allPaymentsCleared} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="p-2 rounded-lg text-platinum-500 hover:bg-white/5 hover:text-platinum-metallic"
                          aria-label={`Edit ${p.projectName}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.projectName)}
                            className="p-2 rounded-lg text-platinum-500 hover:bg-red-500/10 hover:text-red-300"
                            aria-label={`Delete ${p.projectName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
