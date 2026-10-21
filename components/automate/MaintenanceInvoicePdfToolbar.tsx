'use client'

import { useCallback, useState } from 'react'
import { Check, ClipboardCopy, Download, Loader2 } from 'lucide-react'
import {
  copyPdfBlobToClipboard,
  downloadPdfBlob,
  invoicePdfBlobFromElement,
  invoicePdfFileName,
} from '@/lib/invoice-pdf-client'

type PdfStatus = 'idle' | 'working' | 'copied' | 'downloaded' | 'error'

export default function MaintenanceInvoicePdfToolbar({
  invoiceNumber,
  projectName,
  variant = 'dark',
  captureElementId = 'maintenance-invoice-print',
}: {
  invoiceNumber: string
  projectName: string
  variant?: 'dark' | 'light'
  /** Must match MaintenanceInvoicePrintView elementId */
  captureElementId?: string
}) {
  const [status, setStatus] = useState<PdfStatus>('idle')
  const fileName = invoicePdfFileName(invoiceNumber, projectName)

  const generateBlob = useCallback(async () => {
    const root = document.getElementById(captureElementId)
    if (!root) throw new Error('Invoice preview not ready')
    return invoicePdfBlobFromElement(root)
  }, [captureElementId])

  async function handleCopy() {
    setStatus('working')
    try {
      const blob = await generateBlob()
      const ok = await copyPdfBlobToClipboard(blob)
      if (ok) {
        setStatus('copied')
        window.setTimeout(() => setStatus('idle'), 5000)
      } else {
        downloadPdfBlob(blob, fileName)
        setStatus('downloaded')
        window.setTimeout(() => setStatus('idle'), 5000)
      }
    } catch {
      setStatus('error')
      window.setTimeout(() => setStatus('idle'), 4000)
    }
  }

  async function handleDownload() {
    setStatus('working')
    try {
      const blob = await generateBlob()
      downloadPdfBlob(blob, fileName)
      setStatus('downloaded')
      window.setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
      window.setTimeout(() => setStatus('idle'), 4000)
    }
  }

  const isDark = variant === 'dark'
  const btnBase = isDark
    ? 'rounded-xl border px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors disabled:opacity-50'
    : 'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={status === 'working'}
          onClick={() => void handleCopy()}
          className={`inline-flex items-center gap-2 ${btnBase} ${
            isDark
              ? status === 'copied'
                ? 'border-emerald-400/50 bg-emerald-500/25 text-emerald-50'
                : 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25'
              : status === 'copied'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {status === 'working' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === 'copied' ? (
            <Check className="h-4 w-4" />
          ) : (
            <ClipboardCopy className="h-4 w-4" />
          )}
          {status === 'copied' ? 'PDF copied' : 'Copy PDF'}
        </button>
        <button
          type="button"
          disabled={status === 'working'}
          onClick={() => void handleDownload()}
          className={`inline-flex items-center gap-2 ${btnBase} ${
            isDark
              ? 'border-white/10 bg-white/[0.06] text-platinum-200 hover:bg-white/10'
              : 'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50'
          }`}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>
      <p className={`text-[11px] leading-relaxed ${isDark ? 'text-platinum-500' : 'text-neutral-600'}`}>
        {status === 'copied' ? (
          <span className={isDark ? 'text-emerald-200/90' : 'text-emerald-700'}>
            Invoice PDF is on your clipboard — open WhatsApp, click in the message box, and press{' '}
            <kbd className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 font-sans text-[10px]">Ctrl+V</kbd>{' '}
            (or{' '}
            <kbd className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 font-sans text-[10px]">⌘V</kbd>
            ) to paste the file.
          </span>
        ) : status === 'downloaded' ? (
          <span>PDF saved — attach the file from your Downloads folder in WhatsApp.</span>
        ) : status === 'error' ? (
          <span className="text-red-300/90">Could not build PDF. Try Download PDF or refresh the preview.</span>
        ) : (
          <span>
            Copy puts the invoice PDF on your clipboard for WhatsApp Desktop/Web. On mobile, use Download and attach from
            Files.
          </span>
        )}
      </p>
    </div>
  )
}
