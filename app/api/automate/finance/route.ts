import { NextResponse } from 'next/server'
import { canAccessProjectWorkspaceData } from '@/lib/automate-projects-api-auth'
import { createFinanceEntry, listFinanceEntries } from '@/lib/crm-finance-store'
import type { FinanceKind } from '@/types/crm-finance'

export async function GET() {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }
  const entries = await listFinanceEntries()
  return NextResponse.json({ entries })
}

export async function POST(request: Request) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }
  const body = (await request.json().catch(() => null)) as {
    kind?: FinanceKind
    label?: string
    amount?: number
    month?: string
    note?: string
  } | null
  if (!body) {
    return NextResponse.json({ error: 'Invalid entry' }, { status: 400 })
  }
  const entry = await createFinanceEntry({
    kind: body.kind === 'cost' ? 'cost' : 'salary',
    label: body.label ?? '',
    amount: Number(body.amount) || 0,
    month: body.month ?? '',
    note: body.note ?? '',
  })
  if (!entry) {
    return NextResponse.json({ error: 'A name is required.' }, { status: 400 })
  }
  return NextResponse.json({ entry }, { status: 201 })
}
