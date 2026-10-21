export type FinanceKind = 'salary' | 'cost'

export interface FinanceEntry {
  id: string
  kind: FinanceKind
  label: string
  amount: number
  month: string
  note: string
  createdAt: string
}
