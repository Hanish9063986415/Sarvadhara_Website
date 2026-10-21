import { promises as fs } from 'fs'
import path from 'path'
import {
  clampClearanceDay,
  DEFAULT_MAINTENANCE_CLEARANCE_DAY,
  type CrmMaintenanceSettings,
} from '@/types/crm-maintenance-settings'
import { getMaintenanceSettingsDb, updateMaintenanceSettingsDb } from '@/lib/supabase/crm-maintenance-db'
import { assertSupabaseCrmBackend, useSupabaseCrmBackend } from '@/lib/supabase/server'

const DATA_FILE = path.join(process.cwd(), 'data', 'crm-maintenance-settings.json')

export async function getMaintenanceSettings(): Promise<CrmMaintenanceSettings> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return getMaintenanceSettingsDb()
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<CrmMaintenanceSettings>
    return {
      clearanceDay: clampClearanceDay(Number(parsed.clearanceDay) || DEFAULT_MAINTENANCE_CLEARANCE_DAY),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    }
  } catch {
    return {
      clearanceDay: DEFAULT_MAINTENANCE_CLEARANCE_DAY,
      updatedAt: new Date().toISOString(),
    }
  }
}

export async function updateMaintenanceSettings(clearanceDay: number): Promise<CrmMaintenanceSettings> {
  assertSupabaseCrmBackend()
  if (useSupabaseCrmBackend()) return updateMaintenanceSettingsDb(clearanceDay)
  const settings: CrmMaintenanceSettings = {
    clearanceDay: clampClearanceDay(clearanceDay),
    updatedAt: new Date().toISOString(),
  }
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(settings, null, 2), 'utf-8')
  return settings
}
