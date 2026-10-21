import { randomUUID } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { isoFromTimestamptz } from '@/lib/supabase/crm-map'
import type { CrmMaintenanceInvoiceShare } from '@/types/crm-invoice-share'
import type { MaintenanceInvoicePrintProps } from '@/types/maintenance-invoice-print'

function rowToShare(row: Record<string, unknown>): CrmMaintenanceInvoiceShare {
  return {
    id: String(row.id),
    projectId: String(row.project_id ?? ''),
    periodKey: String(row.period_key),
    createdAt: isoFromTimestamptz(row.created_at as string),
    invoiceNumber: String(row.invoice_number ?? ''),
    props: (row.props ?? {}) as MaintenanceInvoicePrintProps,
  }
}

export async function createMaintenanceInvoiceShareDb(input: {
  projectId: string
  periodKey: string
  invoiceNumber: string
  props: MaintenanceInvoicePrintProps
}): Promise<CrmMaintenanceInvoiceShare> {
  const sb = getSupabaseAdmin()
  const row = {
    id: randomUUID(),
    project_id: input.projectId,
    period_key: input.periodKey,
    invoice_number: input.invoiceNumber,
    props: input.props,
  }
  const { data, error } = await sb.from('crm_maintenance_invoice_shares').insert(row).select('*').single()
  if (error) throw new Error(error.message)

  const { data: oldRows } = await sb
    .from('crm_maintenance_invoice_shares')
    .select('id')
    .order('created_at', { ascending: true })
  const ids = (oldRows ?? []).map((r) => String((r as { id: string }).id))
  if (ids.length > 200) {
    const toRemove = ids.slice(0, ids.length - 200)
    await sb.from('crm_maintenance_invoice_shares').delete().in('id', toRemove)
  }

  return rowToShare(data as Record<string, unknown>)
}

export async function getMaintenanceInvoiceShareDb(id: string): Promise<CrmMaintenanceInvoiceShare | null> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from('crm_maintenance_invoice_shares').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return rowToShare(data as Record<string, unknown>)
}
