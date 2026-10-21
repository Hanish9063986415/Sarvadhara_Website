'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react'

export type CrmConfirmTone = 'default' | 'warning' | 'danger'

export default function CrmConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'default',
  loading = false,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  description: React.ReactNode
  confirmLabel?: string
  tone?: CrmConfirmTone
  loading?: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, loading, onClose])

  const iconWrap =
    tone === 'danger'
      ? 'border-red-400/35 bg-red-500/15 text-red-100'
      : tone === 'warning'
        ? 'border-amber-400/35 bg-amber-500/15 text-amber-100'
        : 'border-violet-400/35 bg-violet-500/15 text-violet-100'

  const confirmBtn =
    tone === 'danger'
      ? 'border-red-400/40 bg-gradient-to-r from-red-600/90 to-red-500/80 text-red-50 hover:from-red-500 hover:to-red-400/90'
      : tone === 'warning'
        ? 'border-amber-400/40 bg-gradient-to-r from-amber-600/80 to-amber-500/70 text-amber-50 hover:from-amber-500 hover:to-amber-400/90'
        : 'crm-primary-btn'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!loading) onClose()
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="crm-confirm-title"
            className="fixed left-1/2 top-1/2 z-[91] w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1a22] to-[#121218] shadow-2xl shadow-black/50"
            initial={{ opacity: 0, scale: 0.96, y: '-48%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.96, y: '-48%' }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconWrap}`}>
                  {tone === 'danger' ? (
                    <Trash2 className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h2 id="crm-confirm-title" className="font-luxury text-lg text-platinum-metallic">
                    {title}
                  </h2>
                  <div className="mt-2 text-sm leading-relaxed text-platinum-400">{description}</div>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="rounded-lg border border-white/10 p-1.5 text-platinum-500 transition-colors hover:bg-white/5 hover:text-platinum-200 disabled:opacity-40"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 px-5 py-4 sm:px-6">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs uppercase tracking-wider text-platinum-400 transition-colors hover:text-platinum-metallic disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void onConfirm()}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors disabled:opacity-50 ${confirmBtn}`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
