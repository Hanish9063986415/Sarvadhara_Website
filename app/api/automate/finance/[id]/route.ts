import { NextResponse } from 'next/server'
import { canAccessProjectWorkspaceData } from '@/lib/automate-projects-api-auth'
import { deleteFinanceEntry } from '@/lib/crm-finance-store'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }
  const ok = await deleteFinanceEntry(params.id)
  if (!ok) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
