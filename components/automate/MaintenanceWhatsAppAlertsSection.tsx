'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  Users,
  X,
} from 'lucide-react'
import { projectRecordPath } from '@/lib/automate-routes'
import { formatInr } from '@/lib/format-currency'
import { maintenanceRemainingDue } from '@/lib/maintenance-ledger-calc'
import {
  buildMaintenanceWhatsAppTemplate,
  MAINTENANCE_WHATSAPP_TEMPLATES,
  suggestMaintenanceWhatsAppTemplate,
  type MaintenanceWhatsAppTemplateId,
} from '@/lib/maintenance-whatsapp-templates'
import { normalizeWhatsAppPhone, whatsAppChatUrl } from '@/lib/whatsapp-utils'
import type { MaintenancePeriodLedger } from '@/types/crm-maintenance-record'
import type { CrmProject } from '@/types/crm-project'

const accentRing: Record<string, string> = {
  emerald: 'border-emerald-400/40 bg-emerald-500/15 ring-emerald-400/30',
  amber: 'border-amber-400/40 bg-amber-500/15 ring-amber-400/30',
  violet: 'border-violet-400/40 bg-violet-500/15 ring-violet-400/30',
  sky: 'border-sky-400/40 bg-sky-500/15 ring-sky-400/30',
}

export default function MaintenanceWhatsAppAlertsSection({
  projects,
  ledgerByProject,
  year,
  monthIndex,
  monthLabel,
  periodKey,
  clearanceLabel,
  clearanceDueDateIso,
  loading,
}: {
  projects: CrmProject[]
  ledgerByProject: Map<string, MaintenancePeriodLedger>
  year: number
  monthIndex: number
  monthLabel: string
  periodKey: string
  clearanceDueDateIso?: string
  clearanceLabel: string
  loading: boolean
}) {
  const withPhone = useMemo(
    () =>
      projects.filter((p) => normalizeWhatsAppPhone(p.clientPhone?.trim() ?? '')),
    [projects]
  )

  const [projectId, setProjectId] = useState('')
  const [templateId, setTemplateId] = useState<MaintenanceWhatsAppTemplateId>('monthly_renewal')
  const [message, setMessage] = useState('')
  const [messageDirty, setMessageDirty] = useState(false)
  const [copied, setCopied] = useState(false)
  const [invoiceBusy, setInvoiceBusy] = useState(false)
  const [invoiceUrl, setInvoiceUrl] = useState('')
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'due'>('all')
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    setPanelOpen(false)
  }, [periodKey])

  const project = useMemo(
    () => withPhone.find((p) => p.id === projectId) ?? withPhone[0] ?? null,
    [withPhone, projectId]
  )

  const ledger = project ? ledgerByProject.get(project.id) : undefined

  useEffect(() => {
    if (withPhone.length === 0) {
      setProjectId('')
      return
    }
    if (!projectId || !withPhone.some((p) => p.id === projectId)) {
      const first = withPhone[0]
      setProjectId(first.id)
      const lg = ledgerByProject.get(first.id)
      const suggested = suggestMaintenanceWhatsAppTemplate(lg)
      setTemplateId(suggested)
      setMessageDirty(false)
      setMessage(
        buildMaintenanceWhatsAppTemplate(suggested, {
          project: first,
          year,
          monthIndex,
          ledger: lg,
          clearanceLabel,
        })
      )
    }
  }, [withPhone, projectId, ledgerByProject, year, monthIndex, clearanceLabel])

  const rebuildMessage = useCallback(
    (tpl: MaintenanceWhatsAppTemplateId, customOverride?: string) => {
      if (!project) return ''
      return buildMaintenanceWhatsAppTemplate(
        tpl,
        {
          project,
          year,
          monthIndex,
          ledger,
          clearanceLabel,
          invoiceUrl: tpl === 'payment_received' ? invoiceUrl : undefined,
        },
        tpl === 'custom' ? customOverride ?? message : undefined
      )
    },
    [project, year, monthIndex, ledger, clearanceLabel, invoiceUrl, message]
  )

  useEffect(() => {
    if (!project || messageDirty) return
    setMessage(rebuildMessage(templateId))
  }, [project, templateId, ledger, clearanceLabel, invoiceUrl, messageDirty, rebuildMessage])

  function selectTemplate(id: MaintenanceWhatsAppTemplateId) {
    setTemplateId(id)
    setMessageDirty(false)
    if (project) setMessage(buildMaintenanceWhatsAppTemplate(id, { project, year, monthIndex, ledger, clearanceLabel, invoiceUrl: id === 'payment_received' ? invoiceUrl : undefined }))
  }

  function selectProject(id: string) {
    setProjectId(id)
    setMessageDirty(false)
    setInvoiceUrl('')
    const p = withPhone.find((x) => x.id === id)
    if (p) {
      const lg = ledgerByProject.get(id)
      const suggested = suggestMaintenanceWhatsAppTemplate(lg)
      setTemplateId(suggested)
      setMessage(
        buildMaintenanceWhatsAppTemplate(suggested, {
          project: p,
          year,
          monthIndex,
          ledger: lg,
          clearanceLabel,
        })
      )
    }
  }

  async function attachInvoiceLink() {
    if (!project) return
    setInvoiceBusy(true)
    try {
      const res = await fetch('/api/automate/maintenance-invoice/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, periodKey, clearanceDueDateIso }),
      })
      if (!res.ok) return
      const data = (await res.json()) as { invoiceUrl: string; paidOn?: string }
      setInvoiceUrl(data.invoiceUrl)
      if (!messageDirty && templateId === 'payment_received') {
        setMessage(
          buildMaintenanceWhatsAppTemplate('payment_received', {
            project,
            year,
            monthIndex,
            ledger,
            clearanceLabel,
            invoiceUrl: data.invoiceUrl,
            paidOnIso: data.paidOn,
          })
        )
      }
    } finally {
      setInvoiceBusy(false)
    }
  }

  const waPhone = project ? normalizeWhatsAppPhone(project.clientPhone?.trim() ?? '') : null
  const dueNow = project ? maintenanceRemainingDue(ledger, project.maintenanceMonthlyAmount) : 0

  const filteredRecipients = useMemo(() => {
    if (recipientFilter === 'due') {
      return withPhone.filter((p) => maintenanceRemainingDue(ledgerByProject.get(p.id), p.maintenanceMonthlyAmount) > 0)
    }
    return withPhone
  }, [withPhone, recipientFilter, ledgerByProject])

  function openWhatsApp(target: CrmProject) {
    const phone = normalizeWhatsAppPhone(target.clientPhone?.trim() ?? '')
    if (!phone) return
    const isTarget = target.id === project?.id
    const text = isTarget
      ? message
      : buildMaintenanceWhatsAppTemplate(templateId, {
          project: target,
          year,
          monthIndex,
          ledger: ledgerByProject.get(target.id),
          clearanceLabel,
          invoiceUrl: templateId === 'payment_received' && target.id === project?.id ? invoiceUrl : undefined,
        })
    window.open(whatsAppChatUrl(phone, text), '_blank', 'noopener,noreferrer')
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  function resetToTemplate() {
    if (!project) return
    setMessageDirty(false)
    setMessage(rebuildMessage(templateId))
  }

  function openPanel() {
    setPanelOpen(true)
    window.setTimeout(() => {
      document.getElementById('maintenance-whatsapp-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  if (projects.length === 0) {
    return null
  }

  if (!panelOpen) {
    return (
      <section className="overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/[0.06] via-transparent to-violet-500/[0.04]">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15">
              <MessageCircle className="h-6 w-6 text-emerald-100" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-platinum-500">Client messaging</p>
              <h2 className="font-luxury text-lg text-platinum-metallic sm:text-xl">WhatsApp communication</h2>
              <p className="mt-0.5 text-xs text-platinum-500 sm:text-sm">
                Templates for {monthLabel} — renewal, payment due, confirmations, or custom text.
                {!loading && withPhone.length > 0 ? (
                  <span className="text-platinum-600"> · {withPhone.length} client{withPhone.length === 1 ? '' : 's'} ready</span>
                ) : null}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={openPanel}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-400/35 bg-gradient-to-r from-emerald-600/25 to-emerald-500/15 px-5 py-3 text-xs font-medium uppercase tracking-wider text-emerald-50 shadow-sm transition-colors hover:border-emerald-300/50 hover:from-emerald-500/35 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
            WhatsApp communication
            {!loading ? <ChevronRight className="h-4 w-4 opacity-80" /> : null}
          </button>
        </div>
      </section>
    )
  }

  return (
    <AnimatePresence initial={false}>
      <motion.section
        id="maintenance-whatsapp-panel"
        key="wa-panel-open"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.1] via-black/20 to-violet-500/[0.06]"
      >
      <div className="border-b border-white/10 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/35 bg-emerald-500/20">
              <MessageCircle className="h-6 w-6 text-emerald-100" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/80">Client messaging</p>
              <h2 className="font-luxury text-xl text-platinum-metallic sm:text-2xl">WhatsApp communication</h2>
              <p className="mt-1 max-w-2xl text-sm text-platinum-400">
                Send templated maintenance messages for <span className="text-platinum-200">{monthLabel}</span> — renewal
                reminders, payment due, confirmations, or your own custom text.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-wider text-emerald-100">
              <Users className="h-3.5 w-3.5" />
              {withPhone.length} with WhatsApp
            </span>
            {withPhone.length < projects.length ? (
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-platinum-500">
                {projects.length - withPhone.length} need phone on record
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="rounded-xl border border-white/10 p-2.5 text-platinum-500 transition-colors hover:bg-white/5 hover:text-platinum-200"
              aria-label="Close WhatsApp communication"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-5 border-b border-white/10 p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <div>
            <label className="crm-label" htmlFor="wa-alert-project">
              Recipient
            </label>
            {withPhone.length === 0 ? (
              <p className="mt-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                Add a client WhatsApp number on each project record to send alerts from here.
              </p>
            ) : (
              <select
                id="wa-alert-project"
                className="crm-input mt-1"
                value={projectId}
                onChange={(e) => selectProject(e.target.value)}
              >
                {withPhone.map((p) => {
                  const bal = maintenanceRemainingDue(ledgerByProject.get(p.id), p.maintenanceMonthlyAmount)
                  return (
                    <option key={p.id} value={p.id}>
                      {p.projectName}
                      {p.clientName ? ` · ${p.clientName}` : ''}
                      {bal > 0 ? ` · due ${formatInr(bal)}` : ' · clear'}
                    </option>
                  )
                })}
              </select>
            )}
            {project && (
              <p className="mt-2 text-xs text-platinum-500">
                {project.clientPhone?.trim()}
                {dueNow > 0 ? (
                  <span className="text-amber-200/90"> · Balance {formatInr(dueNow)} ex-GST</span>
                ) : (
                  <span className="text-emerald-200/80"> · No balance this month</span>
                )}
                {' · '}
                <Link href={projectRecordPath(project.id)} className="text-violet-200/90 hover:text-violet-100">
                  Edit contact
                </Link>
              </p>
            )}
          </div>

          <div>
            <p className="crm-label mb-2">Message template</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {MAINTENANCE_WHATSAPP_TEMPLATES.map((tpl) => {
                const active = templateId === tpl.id
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    disabled={!project}
                    onClick={() => selectTemplate(tpl.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      active
                        ? `ring-2 ${accentRing[tpl.accent]}`
                        : 'border-white/10 bg-black/20 hover:border-white/20'
                    } disabled:opacity-40`}
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-platinum-100">{tpl.label}</p>
                    <p className="mt-1 text-[11px] leading-snug text-platinum-500">{tpl.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {templateId === 'payment_received' && project && (ledger?.paidAmount ?? 0) > 0 ? (
            <div className="rounded-xl border border-violet-400/25 bg-violet-500/[0.08] p-4">
              <p className="text-xs text-platinum-300">Include a shareable tax invoice link in the message.</p>
              <button
                type="button"
                disabled={invoiceBusy}
                onClick={() => void attachInvoiceLink()}
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-violet-300/35 px-3 py-2 text-[10px] uppercase tracking-wider text-violet-100 hover:bg-violet-500/15 disabled:opacity-50"
              >
                {invoiceBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                {invoiceUrl ? 'Refresh invoice link' : 'Attach invoice link'}
              </button>
              {invoiceUrl ? (
                <p className="mt-2 truncate text-[10px] text-platinum-500" title={invoiceUrl}>
                  {invoiceUrl}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col p-5 sm:p-7">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="crm-label mb-0">Message preview</p>
            <button
              type="button"
              disabled={!project}
              onClick={resetToTemplate}
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-platinum-500 hover:text-platinum-300 disabled:opacity-40"
            >
              <RefreshCw className="h-3 w-3" />
              Reset template
            </button>
          </div>
          <textarea
            className="min-h-[220px] flex-1 resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-sans text-sm leading-relaxed text-platinum-200 placeholder:text-platinum-600 focus:border-emerald-400/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 disabled:opacity-50"
            value={message}
            disabled={!project}
            onChange={(e) => {
              setMessageDirty(true)
              setMessage(e.target.value)
            }}
            placeholder="Choose a template or write a custom message…"
          />
          <p className="mt-2 text-[10px] text-platinum-600">{message.length} characters · WhatsApp supports *bold* with asterisks</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!project || !waPhone || !message.trim()}
              onClick={() => project && openWhatsApp(project)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-600/90 to-emerald-500/80 px-4 py-3 text-xs font-medium uppercase tracking-wider text-emerald-50 shadow-sm transition-colors hover:from-emerald-500 hover:to-emerald-400/90 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            >
              <Send className="h-4 w-4" />
              Open WhatsApp
            </button>
            <button
              type="button"
              disabled={!message.trim()}
              onClick={() => void copyMessage()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs uppercase tracking-wider text-platinum-300 hover:text-platinum-metallic disabled:opacity-40"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {withPhone.length > 1 ? (
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Quick send</p>
                <div className="inline-flex rounded-lg border border-white/10 p-0.5 text-[10px] uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setRecipientFilter('all')}
                    className={`rounded-md px-2.5 py-1 ${recipientFilter === 'all' ? 'bg-white/10 text-platinum-200' : 'text-platinum-500'}`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientFilter('due')}
                    className={`rounded-md px-2.5 py-1 ${recipientFilter === 'due' ? 'bg-amber-500/20 text-amber-100' : 'text-platinum-500'}`}
                  >
                    With balance
                  </button>
                </div>
              </div>
              <ul className="max-h-40 space-y-1 overflow-y-auto pr-1">
                {filteredRecipients.map((p) => {
                  const phone = normalizeWhatsAppPhone(p.clientPhone?.trim() ?? '')
                  const active = p.id === projectId
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        disabled={!phone}
                        onClick={() => openWhatsApp(p)}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                          active
                            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
                            : 'border-white/5 bg-black/20 text-platinum-400 hover:border-white/15 hover:text-platinum-200'
                        }`}
                      >
                        <span className="truncate">{p.projectName}</span>
                        <MessageCircle className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      </button>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-2 text-[10px] text-platinum-600">
                Opens WhatsApp for each client with the template filled for their project.
              </p>
            </div>
          ) : null}
        </div>
      </div>
      </motion.section>
    </AnimatePresence>
  )
}
