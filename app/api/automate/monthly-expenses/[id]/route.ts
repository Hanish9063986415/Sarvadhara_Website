import { NextResponse } from 'next/server'
import { canAccessProjectWorkspaceData } from '@/lib/automate-projects-api-auth'
import { deleteMonthlyExpense, updateMonthlyExpense } from '@/lib/crm-monthly-expenses-store'
import { clampDueDay, clampRemindDays } from '@/types/crm-monthly-expense'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'Expense name is required.' }, { status: 400 })
  }
  const expense = await updateMonthlyExpense(params.id, {
    title: body.title.trim(),
    amount: Math.max(0, Number(body.amount) || 0),
    dueDay: clampDueDay(Number(body.dueDay) || 1),
    remindDaysBefore: clampRemindDays(Number(body.remindDaysBefore) || 3),
    category: typeof body.category === 'string' ? body.category : '',
    note: typeof body.note === 'string' ? body.note : '',
    active: body.active !== false,
  })
  if (!expense) {
    return NextResponse.json({ error: 'Expense not found.' }, { status: 404 })
  }
  return NextResponse.json({ expense })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }
  const ok = await deleteMonthlyExpense(params.id)
  if (!ok) {
    return NextResponse.json({ error: 'Expense not found.' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
