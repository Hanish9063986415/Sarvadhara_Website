import { NextResponse } from 'next/server'
import { canAccessProjectWorkspaceData } from '@/lib/automate-projects-api-auth'
import { maintenanceInvoicePublicUrl } from '@/lib/app-base-url'
import { buildMaintenanceInvoicePayload } from '@/lib/build-maintenance-invoice-payload'
import { createMaintenanceInvoiceShare } from '@/lib/crm-invoice-shares-store'
import { listMaintenancePaymentRecords } from '@/lib/crm-maintenance-records-store'
import { getCrmProject, listCrmProjects } from '@/lib/crm-projects-store'
import { computeMaintenancePeriodLedger } from '@/lib/maintenance-ledger-calc'
import { parseMonthKey } from '@/lib/maintenance-schedule'

export async function POST(request: Request) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const projectId = typeof body?.projectId === 'string' ? body.projectId.trim() : ''
  const periodKey = typeof body?.periodKey === 'string' ? body.periodKey.trim() : ''
  const clearanceDueDateIso =
    typeof body?.clearanceDueDateIso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.clearanceDueDateIso)
      ? body.clearanceDueDateIso
      : undefined

  if (!projectId || !/^\d{4}-\d{2}$/.test(periodKey)) {
    return NextResponse.json({ error: 'projectId and periodKey (YYYY-MM) are required.' }, { status: 400 })
  }

  const project = await getCrmProject(projectId)
  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  const { year, monthIndex } = parseMonthKey(periodKey)
  const records = await listMaintenancePaymentRecords()
  const ledger = computeMaintenancePeriodLedger(project, year, monthIndex, records)
  const maintainable = (await listCrmProjects()).filter((p) => p.maintenanceEnabled && p.maintenanceMonthlyAmount > 0)
  const projectIndex = Math.max(0, maintainable.findIndex((p) => p.id === projectId))

  const built = buildMaintenanceInvoicePayload({
    project,
    year,
    monthIndex,
    ledger,
    projectIndex,
    clearanceDueDateIso,
  })

  const share = await createMaintenanceInvoiceShare({
    projectId,
    periodKey,
    invoiceNumber: built.invoiceNumber,
    props: built,
  })

  const origin = new URL(request.url).origin
  const invoiceUrl =
    origin && origin !== 'null' ? `${origin}/maintenance-invoice/${share.id}` : maintenanceInvoicePublicUrl(share.id)

  const record = records.find((r) => r.projectId === projectId && r.periodKey === periodKey)

  return NextResponse.json({
    shareId: share.id,
    invoiceUrl,
    invoiceNumber: share.invoiceNumber,
    paidOn: record?.paidOn ?? '',
    props: share.props,
    ledger,
  })
}
