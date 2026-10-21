'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MessageCircle, X } from 'lucide-react'
import MaintenanceInvoicePdfToolbar from '@/components/automate/MaintenanceInvoicePdfToolbar'
import MaintenanceInvoicePrintView from '@/components/automate/MaintenanceInvoicePrintView'
import { buildMaintenancePaymentWhatsAppMessage } from '@/lib/maintenance-whatsapp-alert'
import { whatsAppChatUrl } from '@/lib/whatsapp-utils'
import type { MaintenanceInvoicePrintProps } from '@/types/maintenance-invoice-print'
import type { MaintenancePeriodLedger } from '@/types/crm-maintenance-record'
import type { CrmProject } from '@/types/crm-project'

export default function MaintenanceWhatsAppInvoiceModal({
  open,
  onClose,
  project,
  monthLabel,
  ledger,
  invoiceUrl,
  paidOn,
  invoiceProps,
  waPhoneDigits,
  clientPhoneDisplay,
}: {
  open: boolean
  onClose: () => void
  project: CrmProject
  monthLabel: string
  ledger: MaintenancePeriodLedger | undefined
  invoiceUrl: string
  paidOn: string
  invoiceProps: MaintenanceInvoicePrintProps | null
  waPhoneDigits: string
  clientPhoneDisplay: string
}) {
  const [previewReady, setPreviewReady] = useState(false)

  useEffect(() => {
    if (!open) {
      setPreviewReady(false)
      return
    }
    const t = window.setTimeout(() => setPreviewReady(true), 350)
    return () => window.clearTimeout(t)
  }, [open, invoiceProps])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  function openWhatsApp() {
    const message = buildMaintenancePaymentWhatsAppMessage({
      project,
      monthLabel,
      ledger,
      invoiceUrl,
      paidOnIso: paidOn,
    })
    window.open(whatsAppChatUrl(waPhoneDigits, message), '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {open && invoiceProps && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[90] flex max-h-[100dvh] flex-col overflow-hidden rounded-none border border-white/10 bg-[#0c0c0e] shadow-2xl sm:inset-3 sm:rounded-2xl md:inset-4 lg:inset-8"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
          >
            <div className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/[0.08] via-transparent to-violet-500/[0.06] px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-platinum-500">WhatsApp + invoice</p>
                <h2 className="font-luxury text-xl text-platinum-metallic">{project.projectName}</h2>
                <p className="mt-0.5 text-xs text-platinum-500">
                  {clientPhoneDisplay} · {monthLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 p-2 text-platinum-500 hover:text-platinum-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(280px,360px)_1fr]">
              <div className="shrink-0 space-y-5 overflow-y-auto border-b border-white/10 p-5 lg:border-b-0 lg:border-r lg:p-6">
                <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/[0.08] p-4">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-200/80">Step 1</p>
                  <p className="mt-1 text-sm font-medium text-platinum-100">Copy invoice PDF</p>
                  <div className="mt-4">
                    <MaintenanceInvoicePdfToolbar
                      invoiceNumber={invoiceProps.invoiceNumber}
                      projectName={project.projectName}
                      variant="dark"
                      captureElementId="maintenance-invoice-print-wa"
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-wider text-platinum-600">Step 2</p>
                  <p className="mt-1 text-sm text-platinum-300">Open WhatsApp and paste the PDF in the chat</p>
                  <button
                    type="button"
                    onClick={openWhatsApp}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 py-3 text-xs font-medium uppercase tracking-wider text-emerald-100 hover:bg-emerald-500/30"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Open WhatsApp
                  </button>
                  <p className="mt-3 text-[10px] leading-relaxed text-platinum-600">
                    After copying, paste with Ctrl+V in the message field, then send. The text message includes payment
                    details and the online invoice link.
                  </p>
                </div>
              </div>

              <div className="min-h-0 overflow-y-auto bg-neutral-200/95 p-4 sm:p-6">
                <p className="no-print mb-3 text-center text-[10px] uppercase tracking-wider text-neutral-600">
                  Invoice preview
                </p>
                {!previewReady ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
                  </div>
                ) : (
                  <MaintenanceInvoicePrintView elementId="maintenance-invoice-print-wa" {...invoiceProps} />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
