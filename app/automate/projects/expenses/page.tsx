'use client'

import AutomateShell from '@/components/automate/AutomateShell'
import MonthlyExpensesBoard from '@/components/automate/MonthlyExpensesBoard'

export default function MonthlyExpensesPage() {
  return (
    <AutomateShell title="Monthly expenses" subtitle="Due dates, reminders, and recurring outflow">
      <MonthlyExpensesBoard />
    </AutomateShell>
  )
}
