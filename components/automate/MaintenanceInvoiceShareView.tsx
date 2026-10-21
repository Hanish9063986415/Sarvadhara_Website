'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import MaintenanceInvoicePdfToolbar from '@/components/automate/MaintenanceInvoicePdfToolbar'
import MaintenanceInvoicePrintView from '@/components/automate/MaintenanceInvoicePrintView'
import type { CrmMaintenanceInvoiceShare } from '@/types/crm-invoice-share'

export default function MaintenanceInvoiceShareView({
  share,
  autoprint,
}: {
  share: CrmMaintenanceInvoiceShare
  autoprint?: boolean
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 300)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!autoprint || !ready) return
    const t = window.setTimeout(() => {
      document.body.classList.add('printing-maintenance-invoice')
      window.print()
      window.setTimeout(() => document.body.classList.remove('printing-maintenance-invoice'), 500)
    }, 400)
    return () => window.clearTimeout(t)
  }, [autoprint, ready])

  return (
    <div className="min-h-screen bg-neutral-100 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-8 max-w-3xl rounded-2xl border border-neutral-200 bg-white px-6 py-6 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Sarvadhara maintenance invoice</p>
        <h1 className="mt-1 font-sans text-xl font-semibold text-neutral-900">
          {share.invoiceNumber} — {share.props.servicePeriodLabel}
        </h1>
        <div className="mt-5">
          {ready ? (
            <MaintenanceInvoicePdfToolbar
              invoiceNumber={share.invoiceNumber}
              projectName={share.props.clientName || 'Client'}
              variant="light"
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing PDF…
            </div>
          )}
        </div>
      </div>
      <div className="px-4 print:px-0">
        {ready ? (
          <MaintenanceInvoicePrintView {...share.props} />
        ) : (
          <div className="flex justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-neutral-400" />
          </div>
        )}
      </div>
    </div>
  )
}
