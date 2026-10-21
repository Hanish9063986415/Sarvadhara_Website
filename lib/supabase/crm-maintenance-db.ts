import { getSupabaseAdmin } from '@/lib/supabase/server'
import { dateOrNull, isoFromDate, isoFromTimestamptz } from '@/lib/supabase/crm-map'
import type { CrmMaintenancePaymentRecord } from '@/types/crm-maintenance-record'
import {
  clampClearanceDay,
  DEFAULT_MAINTENANCE_CLEARANCE_DAY,
  type CrmMaintenanceSettings,
} from '@/types/crm-maintenance-settings'
import { randomUUID } from 'crypto'

function rowToRecord(row: Record<string, unknown>): CrmMaintenancePaymentRecord {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    periodKey: String(row.period_key),
    paidAmount: Number(row.paid_amount) || 0,
    paidOn: isoFromDate(row.paid_on as string),
    note: String(row.note ?? ''),
    updatedAt: isoFromTimestamptz(row.updated_at as string),
  }
}

export async function listMaintenancePaymentRecordsDb(): Promise<CrmMaintenancePaymentRecord[]> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from('crm_maintenance_payment_records').select('*')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => rowToRecord(r as Record<string, unknown>))
}

export async function upsertMaintenancePaymentRecordDb(input: {
  projectId: string
  periodKey: string
  paidAmount: number
  paidOn: string
  note: string
}): Promise<CrmMaintenancePaymentRecord> {
  const sb = getSupabaseAdmin()
  const { data: existing } = await sb
    .from('crm_maintenance_payment_records')
    .select('id')
    .eq('project_id', input.projectId)
    .eq('period_key', input.periodKey)
    .maybeSingle()

  const id = existing?.id ? String(existing.id) : randomUUID()
  const row = {
    id,
    project_id: input.projectId,
    period_key: input.periodKey,
    paid_amount: Math.max(0, input.paidAmount),
    paid_on: dateOrNull(input.paidOn),
    note: input.note.trim().slice(0, 500),
  }
  const { data, error } = await sb.from('crm_maintenance_payment_records').upsert(row).select('*').single()
  if (error) throw new Error(error.message)
  return rowToRecord(data as Record<string, unknown>)
}

export async function deleteMaintenancePaymentRecordDb(
  projectId: string,
  periodKey: string
): Promise<boolean> {
  const sb = getSupabaseAdmin()
  const { error, count } = await sb
    .from('crm_maintenance_payment_records')
    .delete({ count: 'exact' })
    .eq('project_id', projectId)
    .eq('period_key', periodKey)
  if (error) throw new Error(error.message)
  return (count ?? 0) > 0
}

export async function deleteMaintenanceRecordsForProjectDb(projectId: string): Promise<number> {
  const sb = getSupabaseAdmin()
  const { error, count } = await sb
    .from('crm_maintenance_payment_records')
    .delete({ count: 'exact' })
    .eq('project_id', projectId)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function getMaintenanceSettingsDb(): Promise<CrmMaintenanceSettings> {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from('crm_maintenance_settings').select('*').eq('id', 'default').maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) {
    return { clearanceDay: DEFAULT_MAINTENANCE_CLEARANCE_DAY, updatedAt: new Date().toISOString() }
  }
  const row = data as Record<string, unknown>
  return {
    clearanceDay: clampClearanceDay(Number(row.clearance_day) || DEFAULT_MAINTENANCE_CLEARANCE_DAY),
    updatedAt: isoFromTimestamptz(row.updated_at as string),
  }
}

export async function updateMaintenanceSettingsDb(clearanceDay: number): Promise<CrmMaintenanceSettings> {
  const sb = getSupabaseAdmin()
  const row = {
    id: 'default',
    clearance_day: clampClearanceDay(clearanceDay),
  }
  const { data, error } = await sb.from('crm_maintenance_settings').upsert(row).select('*').single()
  if (error) throw new Error(error.message)
  const r = data as Record<string, unknown>
  return {
    clearanceDay: clampClearanceDay(Number(r.clearance_day)),
    updatedAt: isoFromTimestamptz(r.updated_at as string),
  }
}
