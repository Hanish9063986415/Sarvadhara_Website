'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileText, Mail, Plus, Printer, Trash2, X } from 'lucide-react'
import CrmDateField from '@/components/automate/CrmDateField'
import MaintenanceInvoicePdfToolbar from '@/components/automate/MaintenanceInvoicePdfToolbar'
import MaintenanceInvoicePrintView from '@/components/automate/MaintenanceInvoicePrintView'
import { formatInrDecimal } from '@/lib/format-currency'
import { billingDateForMonth, formatMonthLabel } from '@/lib/maintenance-schedule'
import {
  invoiceTotals,
  lineTotalInclGst,
  suggestMaintenanceInvoiceNumber,
  type MaintenanceInvoiceLine,
} from '@/lib/maintenance-invoice-math'
import { isoFromLocalDate, todayIso } from '@/lib/crm-dates'
import { SARVADHARA_INVOICE_FROM } from '@/lib/sarvadhara-invoice-from'
import type { CrmProject } from '@/types/crm-project'

function isoFromDate(date: Date): string {
  return isoFromLocalDate(date)
}

function blankLine(): MaintenanceInvoiceLine {
  return { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }
}

function defaultServiceName(project: CrmProject, servicePeriodLabel: string): string {
  const subject = project.clientName.trim() || project.projectName.trim()
  return `${subject} Website Maintenance — ${servicePeriodLabel}`
}

export default function MaintenanceInvoiceBuilder({
  projects,
  year,
  monthIndex,
  initialProjectId,
  onClose,
  amountDueByProjectId = {},
  clearanceDueDateIso,
}: {
  projects: CrmProject[]
  year: number
  monthIndex: number
  initialProjectId: string
  onClose: () => void
  /** Ledger total due (retainer + carry-forward) per project for this month */
  amountDueByProjectId?: Record<string, number>
  /** Company clearance deadline for this billing month */
  clearanceDueDateIso?: string
}) {
  const maintainable = useMemo(
    () => projects.filter((p) => p.maintenanceEnabled && p.maintenanceMonthlyAmount > 0),
    [projects]
  )

  const [projectId, setProjectId] = useState(initialProjectId)
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(() => todayIso())
  const [dueDate, setDueDate] = useState(() => todayIso())
  const [gstPercent, setGstPercent] = useState('18')
  const [issuerGstin, setIssuerGstin] = useState(SARVADHARA_INVOICE_FROM.gstin)
  const [lines, setLines] = useState<MaintenanceInvoiceLine[]>([blankLine()])
  const [notes, setNotes] = useState('')

  const project = maintainable.find((p) => p.id === projectId) ?? null
  const servicePeriodLabel = formatMonthLabel(year, monthIndex)

  useEffect(() => {
    setProjectId(initialProjectId)
  }, [initialProjectId])

  useEffect(() => {
    if (maintainable.length === 0) return
    if (!maintainable.some((p) => p.id === projectId)) {
      setProjectId(maintainable[0].id)
    }
  }, [maintainable, projectId])

  useEffect(() => {
    if (!project) return
    const idx = maintainable.findIndex((p) => p.id === project.id)
    setInvoiceNumber(suggestMaintenanceInvoiceNumber(idx >= 0 ? idx : 0))
    if (clearanceDueDateIso && /^\d{4}-\d{2}-\d{2}$/.test(clearanceDueDateIso)) {
      setDueDate(clearanceDueDateIso)
    } else {
      const due = billingDateForMonth(year, monthIndex, project.maintenanceBillingDay)
      setDueDate(isoFromDate(due))
    }
    const billAmount = amountDueByProjectId[project.id] ?? project.maintenanceMonthlyAmount
    setLines([
      {
        id: crypto.randomUUID(),
        description: defaultServiceName(project, servicePeriodLabel),
        quantity: 1,
        unitPrice: billAmount,
      },
    ])
  }, [project?.id, year, monthIndex, servicePeriodLabel, maintainable, project, amountDueByProjectId, clearanceDueDateIso])

  const gstNum = Number(gstPercent) || 0
  const totals = useMemo(() => invoiceTotals(lines, gstNum), [lines, gstNum])

  function updateLine(id: string, patch: Partial<MaintenanceInvoiceLine>) {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)))
  }

  function addLine() {
    setLines((prev) => [...prev, blankLine()])
  }

  function removeLine(id: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((line) => line.id !== id)))
  }

  function handlePrint() {
    document.body.classList.add('printing-maintenance-invoice')
    window.print()
    window.setTimeout(() => document.body.classList.remove('printing-maintenance-invoice'), 500)
  }

  function handleEmailClient() {
    if (!project?.clientEmail?.trim()) {
      window.alert('Add client email on the project record before sending.')
      return
    }
    const subject = encodeURIComponent(`Invoice ${invoiceNumber} — ${servicePeriodLabel}`)
    const body = encodeURIComponent(
      `Dear ${project.clientName || 'Client'},\n\n` +
        `Please find our maintenance invoice for ${servicePeriodLabel}.\n\n` +
        `Invoice No #: ${invoiceNumber}\n` +
        `Invoice date: ${invoiceDate}\n` +
        `Due date: ${dueDate}\n` +
        `Total (INR): ${formatInrDecimal(totals.grandTotal)} (Amount ${formatInrDecimal(totals.subtotal)} + IGST ${formatInrDecimal(totals.gstAmount)})\n\n` +
        `Print or save the invoice PDF from Automate and attach it to this email.\n\n` +
        `Regards,\n${SARVADHARA_INVOICE_FROM.legalName}`
    )
    window.location.href = `mailto:${encodeURIComponent(project.clientEmail.trim())}?subject=${subject}&body=${body}`
  }

  if (maintainable.length === 0) {
    return null
  }

  return (
    <section id="maintenance-invoice-builder" className="space-y-6">
      <div className="no-print rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] to-transparent p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-violet-200/90">
              <FileText className="h-5 w-5" />
              <h3 className="font-luxury text-lg text-platinum-metallic">Maintenance invoice builder</h3>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-platinum-500">
              Matches your sample invoice layout — Billed By / Billed To, service lines with GST, Amount, IGST, and
              Total (INR) for {servicePeriodLabel}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleEmailClient}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-300 hover:text-platinum-metallic"
            >
              <Mail className="h-4 w-4" />
              Email client
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-400 hover:border-red-400/30 hover:text-red-200"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="crm-label">Maintenance client</label>
            <select className="crm-input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {maintainable.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName} — {p.clientName || 'Client TBD'} ({formatInrDecimal(p.maintenanceMonthlyAmount)}/mo)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="crm-label">Invoice No #</label>
            <input className="crm-input font-sans tabular-nums" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="STI0011" />
          </div>
          <CrmDateField label="Invoice date" value={invoiceDate} onChange={setInvoiceDate} required />
          <CrmDateField label="Due date" value={dueDate} onChange={setDueDate} required />
          <div>
            <label className="crm-label">Default GST % (IGST)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              className="crm-input font-sans tabular-nums"
              value={gstPercent}
              onChange={(e) => setGstPercent(e.target.value)}
            />
          </div>
          <div>
            <label className="crm-label">Sarvadhara GSTIN (optional)</label>
            <input
              className="crm-input font-sans tabular-nums uppercase"
              value={issuerGstin}
              onChange={(e) => setIssuerGstin(e.target.value)}
              placeholder="29AAAAA0000A1Z5"
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-platinum-500">Service lines</p>
            <button type="button" onClick={addLine} className="inline-flex items-center gap-1 text-xs text-platinum-400 hover:text-platinum-metallic">
              <Plus className="h-3.5 w-3.5" />
              Add service
            </button>
          </div>
          <div className="hidden sm:grid sm:grid-cols-12 sm:gap-3 sm:px-1 sm:pb-1 text-[10px] uppercase tracking-wider text-platinum-600">
            <span className="sm:col-span-5">Service name</span>
            <span className="sm:col-span-2">GST rate</span>
            <span className="sm:col-span-2">Rate (₹)</span>
            <span className="sm:col-span-2 text-right">Total (incl. GST)</span>
            <span className="sm:col-span-1" />
          </div>
          <div className="space-y-3">
            {lines.map((line) => {
              const lineTotal = lineTotalInclGst(line, gstNum)
              return (
                <div key={line.id} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-3 sm:grid-cols-12 sm:items-end">
                  <div className="sm:col-span-5">
                    <label className="crm-label sm:sr-only">Service name</label>
                    <input
                      className="crm-input"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, { description: e.target.value })}
                      placeholder="Website Maintenance"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="crm-label sm:sr-only">GST rate</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      className="crm-input tabular-nums"
                      value={line.gstPercent ?? gstPercent}
                      onChange={(e) => updateLine(line.id, { gstPercent: Number(e.target.value) })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="crm-label sm:sr-only">Rate</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className="crm-input tabular-nums"
                      value={line.unitPrice || ''}
                      onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value), quantity: 1 })}
                    />
                  </div>
                  <div className="sm:col-span-2 sm:text-right">
                    <label className="crm-label sm:sr-only">Total</label>
                    <p className="crm-stat-sm py-2.5 sm:text-right">{formatInrDecimal(lineTotal)}</p>
                  </div>
                  <div className="flex sm:col-span-1 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      className="rounded-lg p-2 text-platinum-500 hover:bg-white/5 hover:text-red-300"
                      aria-label="Remove line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-platinum-600">Amount</p>
            <p className="crm-stat-md mt-1">{formatInrDecimal(totals.subtotal)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-platinum-600">IGST</p>
            <p className="crm-stat-md mt-1">{formatInrDecimal(totals.gstAmount)}</p>
          </div>
          <div className="rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-violet-200/80">Total (INR)</p>
            <p className="crm-stat-md mt-1 text-violet-100">{formatInrDecimal(totals.grandTotal)}</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="crm-label">Notes (optional — shown below totals on invoice)</label>
          <textarea
            rows={2}
            className="crm-input resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bank / UPI details if needed"
          />
        </div>

        {project && !project.clientAddress.trim() && (
          <p className="mt-3 text-xs text-amber-200/90">
            Client address is empty — add it on the project record to fill Billed To like the sample (street, city, PIN).
          </p>
        )}
      </div>

      <div className="py-2">
        <p className="no-print mb-3 text-center text-[10px] uppercase tracking-[0.16em] text-platinum-500">Invoice preview</p>
        <MaintenanceInvoicePrintView
          elementId="maintenance-invoice-print-builder"
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          dueDate={dueDate}
          servicePeriodLabel={servicePeriodLabel}
          gstPercent={totals.gstPercent}
          subtotal={totals.subtotal}
          gstAmount={totals.gstAmount}
          grandTotal={totals.grandTotal}
          lines={lines}
          issuerGstin={issuerGstin}
          clientName={project?.clientName ?? ''}
          clientAddress={project?.clientAddress ?? ''}
          clientEmail={project?.clientEmail ?? ''}
          clientPhone={project?.clientPhone ?? ''}
          notes={notes}
        />
        {project ? (
          <div className="no-print mx-auto mt-6 max-w-[794px] rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
            <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-platinum-500">Print &amp; PDF</p>
            <p className="mb-4 text-xs text-platinum-600">
              Print or save from the browser, or copy / download the same layout as the preview above.
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handlePrint} className="crm-primary-btn inline-flex gap-2">
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </button>
            </div>
            <div className="mt-4">
              <MaintenanceInvoicePdfToolbar
                invoiceNumber={invoiceNumber}
                projectName={project.projectName}
                captureElementId="maintenance-invoice-print-builder"
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
