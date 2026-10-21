'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Wallet } from 'lucide-react'
import { useCrmProjects } from '@/components/automate/useCrmProjects'
import { crmProjectToInput } from '@/lib/crm-project-api-parse'
import {
  billingDateForMonth,
  clearanceDateForMonth,
  formatClearanceLabel,
  formatMonthLabel,
  maintenanceProjectsForMonth,
  monthKey,
  parseMonthKey,
  rollingMonths,
} from '@/lib/maintenance-schedule'
import { todayIso } from '@/lib/crm-dates'
import { DEFAULT_MAINTENANCE_CLEARANCE_DAY } from '@/types/crm-maintenance-settings'
import MaintenanceProjectComposer from '@/components/automate/MaintenanceProjectComposer'
import MaintenanceInvoiceBuilder from '@/components/automate/MaintenanceInvoiceBuilder'
import MaintenanceOverviewStrip, { type MaintenanceFilter } from '@/components/automate/MaintenanceOverviewStrip'
import MaintenanceWhatsAppAlertsSection from '@/components/automate/MaintenanceWhatsAppAlertsSection'
import MaintenanceProjectRow from '@/components/automate/MaintenanceProjectRow'
import { maintenanceProjectHistoryPath } from '@/lib/automate-routes'
import type { MaintenancePeriodLedger } from '@/types/crm-maintenance-record'
import type { CrmProject } from '@/types/crm-project'

type LedgerSummary = {
  rows: MaintenancePeriodLedger[]
  totalMonthlyFees: number
  totalCarryIn: number
  totalDue: number
  totalPaid: number
  totalOutstanding: number
  unpaidProjects: number
  paidProjects: number
  partialProjects: number
  projectCount: number
}

function rowMatchesFilter(ledger: MaintenancePeriodLedger | undefined, filter: MaintenanceFilter): boolean {
  if (filter === 'all') return true
  const status = ledger?.status ?? 'unpaid'
  if (filter === 'paid') return status === 'paid'
  if (filter === 'partial') return status === 'partial'
  if (filter === 'unpaid') return (ledger?.balance ?? 1) > 0
  return true
}

export default function MaintenanceSchedule() {
  const { projects, loading, error, setError, reload, canDeleteProjects } = useCrmProjects()
  const [monthAnchor] = useState(() => new Date())
  const [selectedKey, setSelectedKey] = useState(() =>
    monthKey(monthAnchor.getFullYear(), monthAnchor.getMonth())
  )
  const [paymentSavingId, setPaymentSavingId] = useState<string | null>(null)
  const [invoicePanel, setInvoicePanel] = useState<{ projectId: string } | null>(null)
  const [ledgerSummary, setLedgerSummary] = useState<LedgerSummary | null>(null)
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [filter, setFilter] = useState<MaintenanceFilter>('all')
  const [clearanceDay, setClearanceDay] = useState(DEFAULT_MAINTENANCE_CLEARANCE_DAY)
  const [savingClearanceDay, setSavingClearanceDay] = useState(false)
  const [manageBusyId, setManageBusyId] = useState<string | null>(null)
  useEffect(() => {
    setInvoicePanel(null)
    setFilter('all')
  }, [selectedKey])

  const { year, monthIndex } = parseMonthKey(selectedKey)
  const monthLabel = formatMonthLabel(year, monthIndex)
  const maintainable = useMemo(() => maintenanceProjectsForMonth(projects), [projects])
  const rolling = useMemo(() => rollingMonths(6, monthAnchor), [monthAnchor])

  const loadLedger = useCallback(async () => {
    setLedgerLoading(true)
    const res = await fetch(`/api/automate/maintenance-records?period=${encodeURIComponent(selectedKey)}`)
    setLedgerLoading(false)
    if (!res.ok) return
    const data = (await res.json()) as { summary: LedgerSummary }
    setLedgerSummary(data.summary)
  }, [selectedKey])

  useEffect(() => {
    if (!loading) loadLedger()
  }, [loading, loadLedger, projects])

  useEffect(() => {
    async function loadSettings() {
      const res = await fetch('/api/automate/maintenance-settings')
      if (!res.ok) return
      const data = (await res.json()) as { settings: { clearanceDay: number } }
      setClearanceDay(data.settings.clearanceDay)
    }
    loadSettings()
  }, [])

  const clearanceDate = useMemo(
    () => clearanceDateForMonth(year, monthIndex, clearanceDay),
    [year, monthIndex, clearanceDay]
  )
  const clearanceLabel = formatClearanceLabel(clearanceDate)
  const clearanceDueDateIso = useMemo(() => {
    const d = clearanceDate
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [clearanceDate])
  const pastClearance = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadline = new Date(clearanceDate)
    deadline.setHours(23, 59, 59, 999)
    return today > deadline
  }, [clearanceDate])

  const ledgerByProject = useMemo(() => {
    const map = new Map<string, MaintenancePeriodLedger>()
    for (const row of ledgerSummary?.rows ?? []) {
      map.set(row.projectId, row)
    }
    return map
  }, [ledgerSummary])

  const amountDueByProjectId = useMemo(() => {
    const out: Record<string, number> = {}
    for (const row of ledgerSummary?.rows ?? []) {
      out[row.projectId] = row.amountDue
    }
    return out
  }, [ledgerSummary])

  const monthRows = useMemo(() => {
    return maintainable
      .map((p) => ({
        project: p,
        dueDate: billingDateForMonth(year, monthIndex, p.maintenanceBillingDay),
        ledger: ledgerByProject.get(p.id),
      }))
      .filter((row) => rowMatchesFilter(row.ledger, filter))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  }, [maintainable, year, monthIndex, ledgerByProject, filter])

  function shiftMonth(delta: number) {
    const d = new Date(year, monthIndex + delta, 1)
    setSelectedKey(monthKey(d.getFullYear(), d.getMonth()))
  }

  async function saveClearanceDay(day: number) {
    setSavingClearanceDay(true)
    const res = await fetch('/api/automate/maintenance-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clearanceDay: day }),
    })
    setSavingClearanceDay(false)
    if (res.ok) {
      const data = (await res.json()) as { settings: { clearanceDay: number } }
      setClearanceDay(data.settings.clearanceDay)
    }
  }

  async function setProjectPaidStatus(projectId: string, paid: boolean) {
    const ledger = ledgerByProject.get(projectId)
    const amountDue = ledger?.amountDue ?? maintainable.find((p) => p.id === projectId)?.maintenanceMonthlyAmount ?? 0
    if (paid) {
      await saveMaintenancePayment(projectId, amountDue, todayIso(), '')
    } else {
      await saveMaintenancePayment(projectId, 0, '', '')
    }
  }

  async function saveMaintenancePayment(projectId: string, paidAmount: number, paidOn: string, note: string) {
    setPaymentSavingId(projectId)
    setError(null)
    const res = await fetch('/api/automate/maintenance-records', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, periodKey: selectedKey, paidAmount, paidOn, note }),
    })
    setPaymentSavingId(null)
    if (!res.ok) {
      setError('Could not save maintenance payment.')
      return
    }
    const data = (await res.json()) as { summary: LedgerSummary }
    setLedgerSummary(data.summary)
  }

  function closeInvoicePanel() {
    setInvoicePanel(null)
  }

  function toggleInvoicePanel(projectId: string) {
    setInvoicePanel((prev) => {
      const closing = prev?.projectId === projectId
      if (closing) return null
      window.setTimeout(() => {
        document.getElementById('maintenance-invoice-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
      return { projectId }
    })
  }

  function afterProjectRemovedFromBilling(projectId: string) {
    if (invoicePanel?.projectId === projectId) setInvoicePanel(null)
  }

  async function clearMonthPayment(projectId: string) {
    setManageBusyId(projectId)
    setError(null)
    const res = await fetch(
      `/api/automate/maintenance-records?period=${encodeURIComponent(selectedKey)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, periodKey: selectedKey }),
      }
    )
    setManageBusyId(null)
    if (!res.ok) {
      setError('Could not clear this month’s payment.')
      return
    }
    const data = (await res.json()) as { summary?: LedgerSummary }
    if (data.summary) setLedgerSummary(data.summary)
    else await loadLedger()
  }

  async function removeFromBilling(project: CrmProject) {
    setManageBusyId(project.id)
    setError(null)
    const res = await fetch(`/api/automate/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crmProjectToInput({ ...project, maintenanceEnabled: false })),
    })
    setManageBusyId(null)
    if (!res.ok) {
      setError('Could not remove this client from maintenance billing.')
      return
    }
    afterProjectRemovedFromBilling(project.id)
    await reload()
    await loadLedger()
  }

  async function erasePaymentHistory(projectId: string) {
    setManageBusyId(projectId)
    setError(null)
    const res = await fetch(
      `/api/automate/maintenance-records?period=${encodeURIComponent(selectedKey)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, scope: 'all' }),
      }
    )
    setManageBusyId(null)
    if (!res.ok) {
      setError('Could not erase payment history.')
      return
    }
    const data = (await res.json()) as { summary?: LedgerSummary }
    if (data.summary) setLedgerSummary(data.summary)
    else await loadLedger()
  }

  async function deleteMaintenanceProject(projectId: string) {
    setManageBusyId(projectId)
    setError(null)
    const res = await fetch(`/api/automate/projects/${projectId}`, { method: 'DELETE' })
    setManageBusyId(null)
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setError(data.error ?? 'Could not delete this project.')
      return
    }
    afterProjectRemovedFromBilling(projectId)
    await reload()
    await loadLedger()
  }

  return (
    <div className="automate-page-container space-y-6">
      <MaintenanceProjectComposer onCreated={reload} projects={projects} />

      <div className="horizontal-scroll-tabs flex flex-nowrap gap-2 sm:flex-wrap sm:overflow-visible">
        {rolling.map(({ year: y, monthIndex: m }) => {
          const key = monthKey(y, m)
          const active = key === selectedKey
          const label = new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' }).format(new Date(y, m, 1))
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedKey(key)}
              className={`shrink-0 rounded-xl border px-3 py-2.5 text-xs transition-colors min-h-[44px] ${
                active
                  ? 'border-amber-400/40 bg-amber-500/15 text-amber-100'
                  : 'border-white/10 text-platinum-500 hover:text-platinum-metallic'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <MaintenanceOverviewStrip
        monthLabel={monthLabel}
        loading={loading || ledgerLoading}
        stats={ledgerSummary}
        filter={filter}
        onFilterChange={setFilter}
        onPrevMonth={() => shiftMonth(-1)}
        onNextMonth={() => shiftMonth(1)}
        clearanceDay={clearanceDay}
        clearanceLabel={clearanceLabel}
        savingClearanceDay={savingClearanceDay}
        onClearanceDayChange={(day) => {
          const clamped = Math.min(28, Math.max(1, Math.round(day) || DEFAULT_MAINTENANCE_CLEARANCE_DAY))
          setClearanceDay(clamped)
          void saveClearanceDay(clamped)
        }}
      />

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      )}

      <MaintenanceWhatsAppAlertsSection
        projects={maintainable}
        ledgerByProject={ledgerByProject}
        year={year}
        monthIndex={monthIndex}
        monthLabel={monthLabel}
        periodKey={selectedKey}
        clearanceLabel={clearanceLabel}
        clearanceDueDateIso={clearanceDueDateIso}
        loading={loading || ledgerLoading}
      />

      <div id="maintenance-billing-list" className="overflow-visible rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-platinum-500">Billing workspace</p>
            <h3 className="font-luxury text-xl text-platinum-metallic sm:text-2xl">{monthLabel}</h3>
          </div>
          {ledgerSummary && !ledgerLoading && (
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-wider text-emerald-100">
                {ledgerSummary.paidProjects} paid
              </span>
              {ledgerSummary.partialProjects > 0 ? (
                <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[10px] uppercase tracking-wider text-amber-100">
                  {ledgerSummary.partialProjects} partial
                </span>
              ) : null}
              {ledgerSummary.unpaidProjects > 0 ? (
                <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-[10px] uppercase tracking-wider text-red-100/90">
                  {ledgerSummary.unpaidProjects} with balance
                </span>
              ) : null}
            </div>
          )}
        </div>
        <div className="hidden border-b border-white/10 bg-white/[0.02] px-6 py-3 text-[9px] uppercase tracking-wider text-platinum-600 lg:grid lg:grid-cols-[minmax(0,1fr)_repeat(4,minmax(72px,auto))_minmax(140px,auto)_auto] lg:gap-4 sm:grid sm:grid-cols-[minmax(0,1fr)_repeat(4,minmax(72px,auto))_auto]">
          <span>Project</span>
          <span className="text-right">Retainer · +18% IGST</span>
          <span className="text-right">Carry</span>
          <span className="text-right">Due incl. GST</span>
          <span className="text-right">Balance</span>
          <span className="hidden text-center lg:block">Status</span>
          <span className="text-right">Actions</span>
        </div>

        {loading || ledgerLoading ? (
          <p className="p-10 text-center text-sm text-platinum-500">Loading maintenance records…</p>
        ) : maintainable.length === 0 ? (
          <div className="p-10 text-center">
            <Wallet className="mx-auto mb-3 h-10 w-10 text-platinum-600" />
            <p className="text-sm text-platinum-400">No maintenance clients yet.</p>
            <p className="mt-1 text-xs text-platinum-600">Use Create new above to add a retainer project.</p>
          </div>
        ) : monthRows.length === 0 ? (
          <p className="p-10 text-center text-sm text-platinum-500">No projects match this filter for {monthLabel}.</p>
        ) : (
          <ul>
            {monthRows.map(({ project, dueDate, ledger }) => (
              <MaintenanceProjectRow
                key={project.id}
                project={project}
                dueDate={dueDate}
                clearanceLabel={clearanceLabel}
                pastClearance={pastClearance}
                ledger={ledger}
                invoiceOpen={invoicePanel?.projectId === project.id}
                paymentSaving={paymentSavingId === project.id}
                onToggleInvoice={() => toggleInvoicePanel(project.id)}
                onSavePayment={(paidAmount, paidOn, note) =>
                  saveMaintenancePayment(project.id, paidAmount, paidOn, note)
                }
                onSetPaidStatus={(paid) => setProjectPaidStatus(project.id, paid)}
                historyDetailHref={maintenanceProjectHistoryPath(project.id, selectedKey)}
                periodKey={selectedKey}
                billingYear={year}
                billingMonthIndex={monthIndex}
                clearanceDueDateIso={clearanceDueDateIso}
                monthLabel={monthLabel}
                canDeleteProject={canDeleteProjects}
                manageBusy={manageBusyId === project.id}
                onClearMonthPayment={() => clearMonthPayment(project.id)}
                onRemoveFromBilling={() => removeFromBilling(project)}
                onErasePaymentHistory={() => erasePaymentHistory(project.id)}
                onDeleteProject={() => deleteMaintenanceProject(project.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {invoicePanel && maintainable.length > 0 && (
        <MaintenanceInvoiceBuilder
          projects={projects}
          year={year}
          monthIndex={monthIndex}
          initialProjectId={invoicePanel.projectId}
          onClose={closeInvoicePanel}
          amountDueByProjectId={amountDueByProjectId}
          clearanceDueDateIso={clearanceDueDateIso}
        />
      )}
    </div>
  )
}
