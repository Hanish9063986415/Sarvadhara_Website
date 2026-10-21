'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, MessageCircle } from 'lucide-react'
import { projectRecordPath } from '@/lib/automate-routes'
import { formatMonthLabel } from '@/lib/maintenance-schedule'
import { normalizeWhatsAppPhone } from '@/lib/whatsapp-utils'
import MaintenanceWhatsAppInvoiceModal from '@/components/automate/MaintenanceWhatsAppInvoiceModal'
import type { MaintenanceInvoicePrintProps } from '@/types/maintenance-invoice-print'
import type { MaintenancePeriodLedger } from '@/types/crm-maintenance-record'
import type { CrmProject } from '@/types/crm-project'

export default function MaintenanceWhatsAppAlertButton({
  project,
  periodKey,
  year,
  monthIndex,
  ledger,
  clearanceDueDateIso,
  compact,
}: {
  project: CrmProject
  periodKey: string
  year: number
  monthIndex: number
  ledger: MaintenancePeriodLedger | undefined
  clearanceDueDateIso?: string
  compact?: boolean
}) {
  const [busy, setBusy] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [invoiceUrl, setInvoiceUrl] = useState('')
  const [paidOn, setPaidOn] = useState('')
  const [invoiceProps, setInvoiceProps] = useState<MaintenanceInvoicePrintProps | null>(null)

  const phone = project.clientPhone?.trim() ?? ''
  const waPhone = normalizeWhatsAppPhone(phone)
  const monthLabel = formatMonthLabel(year, monthIndex)
  const paidAmount = ledger?.paidAmount ?? 0
  const canSend = Boolean(waPhone) && paidAmount > 0 && !busy

  async function openWhatsAppFlow() {
    if (!waPhone) return
    setBusy(true)
    try {
      const res = await fetch('/api/automate/maintenance-invoice/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, periodKey, clearanceDueDateIso }),
      })
      if (!res.ok) {
        window.alert('Could not prepare invoice for WhatsApp. Try again.')
        return
      }
      const data = (await res.json()) as {
        invoiceUrl: string
        paidOn: string
        props: MaintenanceInvoicePrintProps
      }
      setInvoiceUrl(data.invoiceUrl)
      setPaidOn(data.paidOn)
      setInvoiceProps(data.props)
      setModalOpen(true)
    } finally {
      setBusy(false)
    }
  }

  if (!phone) {
    return (
      <Link
        href={projectRecordPath(project.id)}
        className={`rounded-lg border border-white/10 text-[10px] uppercase tracking-wider text-platinum-500 hover:text-platinum-300 ${
          compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5'
        }`}
        title="Add client WhatsApp number on the project record"
      >
        Add phone
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        disabled={!canSend}
        onClick={() => void openWhatsAppFlow()}
        title={
          paidAmount <= 0
            ? 'Record a payment first, then send WhatsApp with invoice'
            : `Copy invoice PDF and message ${phone} on WhatsApp`
        }
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border text-[10px] font-medium uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5'
        } ${
          canSend
            ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25'
            : 'border-white/10 text-platinum-500'
        }`}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
        WhatsApp
      </button>

      <MaintenanceWhatsAppInvoiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        project={project}
        monthLabel={monthLabel}
        ledger={ledger}
        invoiceUrl={invoiceUrl}
        paidOn={paidOn}
        invoiceProps={invoiceProps}
        waPhoneDigits={waPhone!}
        clientPhoneDisplay={phone}
      />
    </>
  )
}
