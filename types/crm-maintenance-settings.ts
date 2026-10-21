export interface CrmMaintenanceSettings {
  /** Day of each month (1–28) when all maintenance should be cleared */
  clearanceDay: number
  updatedAt: string
}

export const DEFAULT_MAINTENANCE_CLEARANCE_DAY = 21

export function clampClearanceDay(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_MAINTENANCE_CLEARANCE_DAY
  return Math.min(28, Math.max(1, Math.round(value)))
}
