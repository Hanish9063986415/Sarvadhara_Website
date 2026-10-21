'use client'

import { Plus, Trash2, Wallet } from 'lucide-react'
import type { CrmPaymentTransaction } from '@/types/crm-project'
import { financialsFromTransactions } from '@/types/crm-project'
import { formatInr } from '@/lib/format-currency'

type Props = {
  totalContractAmount: number
  transactions: CrmPaymentTransaction[]
  onChange: (transactions: CrmPaymentTransaction[]) => void
  idPrefix: string
}

export default function ProjectPaymentTransactions({
  totalContractAmount,
  transactions,
  onChange,
  idPrefix,
}: Props) {
  const synced = financialsFromTransactions(totalContractAmount, transactions)

  function updateTxn(id: string, patch: Partial<CrmPaymentTransaction>) {
    onChange(transactions.map((txn) => (txn.id === id ? { ...txn, ...patch } : txn)))
  }

  function addTxn() {
    onChange([
      ...transactions,
      {
        id: crypto.randomUUID(),
        label: transactions.length === 0 ? 'First payment' : `Payment ${transactions.length + 1}`,
        amount: 0,
        paidOn: '',
        note: '',
      },
    ])
  }

  function removeTxn(id: string) {
    onChange(transactions.filter((txn) => txn.id !== id))
  }

  return (
    <div className="sm:col-span-2 rounded-2xl border border-blue-400/15 bg-blue-500/[0.04] p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/10">
            <Wallet className="h-5 w-5 text-blue-200" />
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Payment transactions</h3>
            <p className="mt-1 text-xs text-platinum-500">Add every payment received. Cleared amount updates automatically.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-platinum-500">Total cleared</p>
          <p className="crm-stat-md text-emerald-200">{formatInr(synced.paymentsClearedAmount)}</p>
          <p className="text-[11px] text-platinum-600">Balance {formatInr(synced.balance)}</p>
        </div>
      </div>

      <ul className="space-y-3">
        {transactions.map((txn, index) => (
          <li key={txn.id} className="rounded-xl border border-white/10 bg-black/25 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wider text-platinum-500">Transaction {index + 1}</span>
              <button
                type="button"
                onClick={() => removeTxn(txn.id)}
                className="rounded-lg p-1.5 text-platinum-500 hover:bg-red-500/10 hover:text-red-300"
                aria-label={`Remove transaction ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="crm-label" htmlFor={`${idPrefix}-txn-label-${txn.id}`}>
                  Label
                </label>
                <input
                  id={`${idPrefix}-txn-label-${txn.id}`}
                  className="crm-input"
                  value={txn.label}
                  onChange={(e) => updateTxn(txn.id, { label: e.target.value })}
                  placeholder="Advance, milestone, final"
                />
              </div>
              <div>
                <label className="crm-label" htmlFor={`${idPrefix}-txn-amt-${txn.id}`}>
                  Amount (₹)
                </label>
                <input
                  id={`${idPrefix}-txn-amt-${txn.id}`}
                  type="number"
                  min={0}
                  className="crm-input tabular-nums"
                  value={txn.amount || ''}
                  onChange={(e) => updateTxn(txn.id, { amount: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="crm-label" htmlFor={`${idPrefix}-txn-date-${txn.id}`}>
                  Paid on
                </label>
                <input
                  id={`${idPrefix}-txn-date-${txn.id}`}
                  type="date"
                  className="crm-input"
                  value={txn.paidOn}
                  onChange={(e) => updateTxn(txn.id, { paidOn: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="crm-label" htmlFor={`${idPrefix}-txn-note-${txn.id}`}>
                  Note
                </label>
                <input
                  id={`${idPrefix}-txn-note-${txn.id}`}
                  className="crm-input"
                  value={txn.note}
                  onChange={(e) => updateTxn(txn.id, { note: e.target.value })}
                  placeholder="UPI ref, invoice #, etc."
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {transactions.length === 0 && (
        <p className="text-sm text-platinum-500">No payments recorded yet. Add the first transaction below.</p>
      )}

      <button
        type="button"
        onClick={addTxn}
        className="inline-flex items-center gap-2 rounded-xl border border-blue-400/25 bg-blue-500/10 px-4 py-2.5 text-xs uppercase tracking-wider text-blue-100 hover:bg-blue-500/15"
      >
        <Plus className="h-4 w-4" />
        Add transaction
      </button>
    </div>
  )
}
