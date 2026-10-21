'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { FinanceEntry, FinanceKind } from '@/types/crm-finance'
import { formatInr } from '@/lib/format-currency'
import type { CrmProject } from '@/types/crm-project'

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  if (!year || !month) return key
  return new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' }).format(new Date(year, month - 1, 1))
}

function CollectionRing({ collected, outstanding }: { collected: number; outstanding: number }) {
  const total = collected + outstanding
  const ratio = total === 0 ? 0 : collected / total
  const r = 54
  const c = 2 * Math.PI * r
  const collectedLen = c * ratio
  return (
    <div className="flex items-center gap-5">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#34d399"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${collectedLen} ${c - collectedLen}`}
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="14"
          strokeDasharray={`${c - collectedLen} ${collectedLen}`}
          strokeDashoffset={-collectedLen}
          opacity={outstanding > 0 ? 0.85 : 0}
        />
      </svg>
      <div className="space-y-3 text-sm">
        <p className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Collected of contract</p>
        <p className="crm-stat-lg">{total === 0 ? 0 : Math.round(ratio * 100)}%</p>
        <p className="flex items-center gap-2 text-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Revenue {formatInr(collected)}
        </p>
        <p className="flex items-center gap-2 text-amber-200">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Outstanding {formatInr(outstanding)}
        </p>
      </div>
    </div>
  )
}

function CompareBars({
  items,
}: {
  items: { label: string; value: number; tone: string }[]
}) {
  const max = Math.max(...items.map((item) => item.value), 1)
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="text-platinum-400">{item.label}</span>
            <span className="crm-stat-sm text-platinum-200">{formatInr(item.value)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function VaultDashboard({ projects }: { projects: CrmProject[] }) {
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [kind, setKind] = useState<FinanceKind>('salary')
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState(currentMonth())
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/automate/finance')
    if (!res.ok) return
    const data = (await res.json()) as { entries: FinanceEntry[] }
    setEntries(data.entries)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const revenue = projects.reduce((sum, project) => sum + project.paymentsClearedAmount, 0)
  const contract = projects.reduce((sum, project) => sum + project.totalContractAmount, 0)
  const outstanding = projects.reduce((sum, project) => sum + project.balance, 0)
  const retainers = projects
    .filter((project) => project.maintenanceEnabled)
    .reduce((sum, project) => sum + project.maintenanceMonthlyAmount, 0)
  const salaries = entries.filter((entry) => entry.kind === 'salary').reduce((sum, entry) => sum + entry.amount, 0)
  const costs = entries.filter((entry) => entry.kind === 'cost').reduce((sum, entry) => sum + entry.amount, 0)
  const net = revenue - salaries - costs

  const projectBars = useMemo(() => {
    return [...projects]
      .filter((project) => project.paymentsClearedAmount > 0 || project.totalContractAmount > 0)
      .sort((a, b) => b.paymentsClearedAmount - a.paymentsClearedAmount)
      .slice(0, 6)
  }, [projects])
  const projectMax = Math.max(...projectBars.map((project) => project.paymentsClearedAmount), 1)

  const months = useMemo(() => {
    const keys = new Set<string>()
    const now = new Date()
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      keys.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
    }
    entries.forEach((entry) => keys.add(entry.month))
    return Array.from(keys).sort().slice(-6)
  }, [entries])
  const monthMax = Math.max(
    ...months.map((key) =>
      entries.filter((entry) => entry.month === key).reduce((sum, entry) => sum + entry.amount, 0)
    ),
    1
  )

  async function addEntry(event: React.FormEvent) {
    event.preventDefault()
    if (!label.trim()) return
    setSaving(true)
    setError(null)
    const res = await fetch('/api/automate/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, label, amount: Number(amount) || 0, month, note }),
    })
    setSaving(false)
    if (!res.ok) {
      setError('Could not save that entry.')
      return
    }
    setLabel('')
    setAmount('')
    setNote('')
    await load()
  }

  async function removeEntry(id: string) {
    const res = await fetch(`/api/automate/finance/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      setError('Could not remove that entry.')
      return
    }
    await load()
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-platinum-500">Business dashboard</p>
        <p className="mt-1 text-sm text-platinum-400">Revenue collected on projects, set against salaries and other costs.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Revenue till now', value: formatInr(revenue) },
          { label: 'Contract book', value: formatInr(contract) },
          { label: 'Outstanding', value: formatInr(outstanding) },
          { label: 'Salaries', value: formatInr(salaries) },
          { label: 'Other costs', value: formatInr(costs) },
          { label: 'Net after costs', value: formatInr(net) },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-platinum-500">{card.label}</p>
            <p className="mt-2 crm-stat-md">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <h2 className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Revenue collected</h2>
          <div className="mt-5">
            <CollectionRing collected={revenue} outstanding={outstanding} />
          </div>
          <p className="mt-4 text-xs text-platinum-500">
            Monthly retainers on active plans: {formatInr(retainers)}. That figure is not included in revenue till now.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <h2 className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Revenue against costs</h2>
          <div className="mt-5">
            <CompareBars
              items={[
                { label: 'Revenue', value: revenue, tone: 'bg-emerald-400/80' },
                { label: 'Salaries', value: salaries, tone: 'bg-violet-400/80' },
                { label: 'Other costs', value: costs, tone: 'bg-amber-400/80' },
                { label: 'Net', value: Math.max(net, 0), tone: 'bg-platinum-metallic/80' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 lg:col-span-3">
          <h2 className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Revenue by project</h2>
          {projectBars.length === 0 ? (
            <p className="mt-6 text-sm text-platinum-500">Collected payments will appear here as projects are updated.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {projectBars.map((project) => (
                <li key={project.id}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-platinum-300">{project.projectName}</span>
                    <span className="shrink-0 crm-stat-sm text-platinum-200">{formatInr(project.paymentsClearedAmount)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400/80 to-platinum-metallic/70"
                      style={{ width: `${(project.paymentsClearedAmount / projectMax) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Salaries and costs by month</h2>
          <div className="mt-5 flex h-40 items-end gap-2">
            {months.map((key) => {
              const salary = entries
                .filter((entry) => entry.month === key && entry.kind === 'salary')
                .reduce((sum, entry) => sum + entry.amount, 0)
              const cost = entries
                .filter((entry) => entry.month === key && entry.kind === 'cost')
                .reduce((sum, entry) => sum + entry.amount, 0)
              return (
                <div key={key} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <div className="flex h-28 w-full items-end justify-center gap-0.5">
                    <div
                      className="w-2 rounded-t bg-violet-400/80"
                      style={{ height: `${(salary / monthMax) * 100}%` }}
                      title={`Salaries ${formatInr(salary)}`}
                    />
                    <div
                      className="w-2 rounded-t bg-amber-400/80"
                      style={{ height: `${(cost / monthMax) * 100}%` }}
                      title={`Costs ${formatInr(cost)}`}
                    />
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-platinum-600">{monthLabel(key)}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex gap-4 text-[10px] uppercase tracking-wider text-platinum-500">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-violet-400" /> Salary</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-400" /> Cost</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <h2 className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Record salary or cost</h2>
        <form onSubmit={addEntry} className="mt-4 grid gap-3 md:grid-cols-6">
          <select className="crm-input md:col-span-1" value={kind} onChange={(event) => setKind(event.target.value as FinanceKind)}>
            <option value="salary">Salary</option>
            <option value="cost">Other cost</option>
          </select>
          <input
            className="crm-input md:col-span-2"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={kind === 'salary' ? 'Person or team' : 'Cost name'}
            required
          />
          <input
            className="crm-input"
            type="number"
            min={0}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Amount ₹"
            required
          />
          <input className="crm-input" type="month" value={month} onChange={(event) => setMonth(event.target.value)} required />
          <button type="submit" disabled={saving} className="crm-primary-btn">
            {saving ? 'Saving…' : 'Add'}
          </button>
          <input
            className="crm-input md:col-span-6"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note"
          />
        </form>
        {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
        {entries.length > 0 && (
          <ul className="mt-4 divide-y divide-white/[0.06]">
            {entries.slice(0, 8).map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-platinum-200">
                    {entry.label}
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-platinum-500">
                      {entry.kind === 'salary' ? 'Salary' : 'Cost'} · {monthLabel(entry.month)}
                    </span>
                  </p>
                  {entry.note && <p className="truncate text-xs text-platinum-500">{entry.note}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="crm-stat-sm">{formatInr(entry.amount)}</span>
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="rounded-lg p-1.5 text-platinum-500 hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Remove ${entry.label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
