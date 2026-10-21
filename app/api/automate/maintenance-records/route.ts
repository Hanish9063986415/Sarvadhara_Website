import { NextResponse } from 'next/server'
import { canAccessProjectWorkspaceData } from '@/lib/automate-projects-api-auth'
import { listCrmProjects } from '@/lib/crm-projects-store'
import {
  deleteMaintenancePaymentRecord,
  deleteMaintenanceRecordsForProject,
  listMaintenancePaymentRecords,
  upsertMaintenancePaymentRecord,
} from '@/lib/crm-maintenance-records-store'
import { buildMaintenanceHistoryByProject, summarizeMaintenanceMonth } from '@/lib/maintenance-ledger-calc'
import { parseMonthKey } from '@/lib/maintenance-schedule'

export async function GET(request: Request) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }

  const url = new URL(request.url)
  const view = url.searchParams.get('view')
  if (view === 'by-project') {
    const projectId = url.searchParams.get('projectId')?.trim()
    const [projects, records] = await Promise.all([listCrmProjects(), listMaintenancePaymentRecords()])
    let byProject = buildMaintenanceHistoryByProject(projects, records)
    if (projectId) {
      byProject = byProject.filter((p) => p.projectId === projectId)
    }
    const totals = {
      projectCount: byProject.length,
      totalCollected: byProject.reduce((s, p) => s + p.totalCollected, 0),
      totalOutstanding: byProject.reduce((s, p) => s + p.currentOutstanding, 0),
      monthsPaid: byProject.reduce((s, p) => s + p.monthsPaid, 0),
    }
    return NextResponse.json({ byProject, totals })
  }

  const period = url.searchParams.get('period')
  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    return NextResponse.json({ error: 'Query period=YYYY-MM or view=by-project is required.' }, { status: 400 })
  }

  const { year, monthIndex } = parseMonthKey(period)
  const [projects, records] = await Promise.all([listCrmProjects(), listMaintenancePaymentRecords()])
  const summary = summarizeMaintenanceMonth(projects, year, monthIndex, records)

  return NextResponse.json({
    periodKey: period,
    records,
    summary,
  })
}

export async function PATCH(request: Request) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body || typeof body.projectId !== 'string' || typeof body.periodKey !== 'string') {
    return NextResponse.json({ error: 'projectId and periodKey are required.' }, { status: 400 })
  }
  if (!/^\d{4}-\d{2}$/.test(body.periodKey)) {
    return NextResponse.json({ error: 'Invalid periodKey.' }, { status: 400 })
  }

  const paidAmount = Math.max(0, Number(body.paidAmount) || 0)
  const paidOn = typeof body.paidOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.paidOn) ? body.paidOn : ''
  const note = typeof body.note === 'string' ? body.note : ''

  const record = await upsertMaintenancePaymentRecord({
    projectId: body.projectId.trim(),
    periodKey: body.periodKey,
    paidAmount,
    paidOn,
    note,
  })

  const { year, monthIndex } = parseMonthKey(body.periodKey)
  const projects = await listCrmProjects()
  const records = await listMaintenancePaymentRecords()
  const summary = summarizeMaintenanceMonth(projects, year, monthIndex, records)

  return NextResponse.json({ record, summary })
}

export async function DELETE(request: Request) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body || typeof body.projectId !== 'string' || !body.projectId.trim()) {
    return NextResponse.json({ error: 'projectId is required.' }, { status: 400 })
  }

  const projectId = body.projectId.trim()
  const scope = body.scope === 'all' ? 'all' : 'period'
  let removed = 0

  if (scope === 'all') {
    removed = await deleteMaintenanceRecordsForProject(projectId)
  } else {
    if (typeof body.periodKey !== 'string' || !/^\d{4}-\d{2}$/.test(body.periodKey)) {
      return NextResponse.json({ error: 'periodKey (YYYY-MM) is required.' }, { status: 400 })
    }
    const ok = await deleteMaintenancePaymentRecord(projectId, body.periodKey)
    removed = ok ? 1 : 0
  }

  const url = new URL(request.url)
  const period = url.searchParams.get('period') ?? (scope === 'period' ? (body.periodKey as string) : null)
  let summary = null
  if (period && /^\d{4}-\d{2}$/.test(period)) {
    const { year, monthIndex } = parseMonthKey(period)
    const projects = await listCrmProjects()
    const records = await listMaintenancePaymentRecords()
    summary = summarizeMaintenanceMonth(projects, year, monthIndex, records)
  }

  return NextResponse.json({ ok: true, removed, summary })
}
