'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Eraser, LogOut, MoreHorizontal, Receipt, Trash2 } from 'lucide-react'
import CrmConfirmDialog from '@/components/automate/CrmConfirmDialog'
import type { MaintenancePeriodLedger } from '@/types/crm-maintenance-record'
import type { CrmProject } from '@/types/crm-project'

type PendingAction =
  | { kind: 'clear-month' }
  | { kind: 'leave-billing' }
  | { kind: 'erase-history' }
  | { kind: 'delete-project' }

type MenuCoords = {
  top?: number
  bottom?: number
  right: number
  openUp: boolean
}

const MENU_MIN_WIDTH = 248
const MENU_EST_HEIGHT = 280

export default function MaintenanceProjectActionsMenu({
  project,
  monthLabel,
  ledger,
  canDeleteProject,
  busy,
  onClearMonth,
  onLeaveBilling,
  onEraseHistory,
  onDeleteProject,
}: {
  project: CrmProject
  monthLabel: string
  ledger: MaintenancePeriodLedger | undefined
  canDeleteProject: boolean
  busy: boolean
  onClearMonth: () => Promise<void>
  onLeaveBilling: () => Promise<void>
  onEraseHistory: () => Promise<void>
  onDeleteProject: () => Promise<void>
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [coords, setCoords] = useState<MenuCoords | null>(null)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [acting, setActing] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const hasMonthPayment = Boolean(
    ledger &&
      (ledger.paidAmount > 0 ||
        ledger.recordId ||
        ledger.status === 'paid' ||
        ledger.status === 'partial')
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateMenuPosition = useCallback(() => {
    const btn = buttonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < MENU_EST_HEIGHT && rect.top > spaceBelow
    setCoords({
      openUp,
      right: Math.max(8, window.innerWidth - rect.right),
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
    })
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [menuOpen, updateMenuPosition])

  useEffect(() => {
    if (!menuOpen) return
    function onDoc(e: MouseEvent) {
      const target = e.target as Node
      if (wrapRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  function openConfirm(action: PendingAction) {
    setMenuOpen(false)
    setPending(action)
  }

  async function runConfirm() {
    if (!pending) return
    setActing(true)
    try {
      if (pending.kind === 'clear-month') await onClearMonth()
      else if (pending.kind === 'leave-billing') await onLeaveBilling()
      else if (pending.kind === 'erase-history') await onEraseHistory()
      else if (pending.kind === 'delete-project') await onDeleteProject()
      setPending(null)
    } finally {
      setActing(false)
    }
  }

  const dialog = (() => {
    if (!pending) return null
    const name = project.projectName
    if (pending.kind === 'clear-month') {
      return {
        title: 'Clear this month’s payment?',
        description: (
          <>
            Removes recorded payment for <span className="text-platinum-200">{monthLabel}</span> on{' '}
            <span className="text-platinum-200">{name}</span>. The retainer stays on the schedule; balances
            recalculate from cleared data.
          </>
        ),
        confirmLabel: 'Clear payment',
        tone: 'warning' as const,
      }
    }
    if (pending.kind === 'leave-billing') {
      return {
        title: 'Remove from maintenance billing?',
        description: (
          <>
            <span className="text-platinum-200">{name}</span> will no longer appear on the monthly billing
            workspace. Payment history is kept unless you erase it separately. You can re-enable maintenance
            from the project record.
          </>
        ),
        confirmLabel: 'Remove from billing',
        tone: 'warning' as const,
      }
    }
    if (pending.kind === 'erase-history') {
      return {
        title: 'Erase all payment history?',
        description: (
          <>
            Deletes every saved maintenance payment for <span className="text-platinum-200">{name}</span>.
            The project and retainer settings remain unless you delete the project.
          </>
        ),
        confirmLabel: 'Erase history',
        tone: 'danger' as const,
      }
    }
    return {
      title: 'Delete project permanently?',
      description: (
        <>
          <span className="text-platinum-200">{name}</span> and its maintenance history will be removed from
          Automate. This cannot be undone. Admin sign-in is required.
        </>
      ),
      confirmLabel: 'Delete project',
      tone: 'danger' as const,
    }
  })()

  const menuPanel = (
    <AnimatePresence>
      {menuOpen && coords && (
        <motion.div
          ref={menuRef}
          role="menu"
          initial={{ opacity: 0, y: coords.openUp ? 8 : -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: coords.openUp ? 6 : -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            top: coords.top,
            bottom: coords.bottom,
            right: coords.right,
            minWidth: MENU_MIN_WIDTH,
            zIndex: 75,
          }}
          className="overflow-hidden rounded-xl border border-white/15 bg-[#16161f]/98 py-1 shadow-2xl shadow-black/50 ring-1 ring-white/5 backdrop-blur-xl"
        >
          {hasMonthPayment ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm text-platinum-300 transition-colors hover:bg-white/[0.06]"
              onClick={() => openConfirm({ kind: 'clear-month' })}
            >
              <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-amber-200/90" />
              <span>
                <span className="block text-platinum-100">Clear {monthLabel} payment</span>
                <span className="text-[11px] text-platinum-500">Reset paid amount for this period</span>
              </span>
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm text-platinum-300 transition-colors hover:bg-white/[0.06]"
            onClick={() => openConfirm({ kind: 'leave-billing' })}
          >
            <LogOut className="mt-0.5 h-4 w-4 shrink-0 text-platinum-400" />
            <span>
              <span className="block text-platinum-100">Remove from billing</span>
              <span className="text-[11px] text-platinum-500">Hide from maintenance schedule</span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm text-platinum-300 transition-colors hover:bg-white/[0.06]"
            onClick={() => openConfirm({ kind: 'erase-history' })}
          >
            <Eraser className="mt-0.5 h-4 w-4 shrink-0 text-amber-200/80" />
            <span>
              <span className="block text-platinum-100">Erase payment history</span>
              <span className="text-[11px] text-platinum-500">All months for this client</span>
            </span>
          </button>
          {canDeleteProject ? (
            <>
              <div className="my-1 border-t border-white/10" />
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-red-500/10"
                onClick={() => openConfirm({ kind: 'delete-project' })}
              >
                <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                <span>
                  <span className="block text-red-100">Delete project</span>
                  <span className="text-[11px] text-red-200/60">Admin · permanent</span>
                </span>
              </button>
            </>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <div ref={wrapRef} className="relative z-[1]">
        <button
          ref={buttonRef}
          type="button"
          disabled={busy}
          onClick={() => {
            setMenuOpen((open) => {
              const next = !open
              if (next) queueMicrotask(updateMenuPosition)
              return next
            })
          }}
          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50 ${
            menuOpen
              ? 'border-amber-400/35 bg-amber-500/10 text-amber-100'
              : 'border-white/10 text-platinum-400 hover:border-white/20 hover:text-platinum-metallic'
          }`}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
          Manage
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {mounted && typeof document !== 'undefined' ? createPortal(menuPanel, document.body) : null}

      {dialog && (
        <CrmConfirmDialog
          open={Boolean(pending)}
          title={dialog.title}
          description={dialog.description}
          confirmLabel={dialog.confirmLabel}
          tone={dialog.tone}
          loading={acting || busy}
          onClose={() => {
            if (!acting && !busy) setPending(null)
          }}
          onConfirm={runConfirm}
        />
      )}
    </>
  )
}
