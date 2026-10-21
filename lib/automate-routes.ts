/** Direct-access only — not linked from public site navigation. */
export const AUTOMATE_BASE_PATH = '/automate'
export const AUTOMATE_PROJECTS_PATH = `${AUTOMATE_BASE_PATH}/projects`
export const AUTOMATE_PROJECTS_LOGIN_PATH = `${AUTOMATE_PROJECTS_PATH}/login`
export const AUTOMATE_PROJECTS_VAULT_PATH = `${AUTOMATE_PROJECTS_PATH}/vault`
export const AUTOMATE_PROJECTS_TRACK_PATH = `${AUTOMATE_PROJECTS_PATH}/track`
export const AUTOMATE_PROJECTS_NEW_PATH = `${AUTOMATE_PROJECTS_PATH}/new`
export const AUTOMATE_PROJECTS_MAINTENANCE_PATH = `${AUTOMATE_PROJECTS_PATH}/maintenance`
export const AUTOMATE_PROJECTS_EXPENSES_PATH = `${AUTOMATE_PROJECTS_PATH}/expenses`

export function projectRecordPath(id: string): string {
  return `${AUTOMATE_PROJECTS_PATH}/${id}`
}

export function maintenanceProjectHistoryPath(projectId: string, periodKey?: string): string {
  const base = `${AUTOMATE_PROJECTS_MAINTENANCE_PATH}/${projectId}`
  if (periodKey && /^\d{4}-\d{2}$/.test(periodKey)) {
    return `${base}?period=${encodeURIComponent(periodKey)}`
  }
  return base
}

/** @deprecated Legacy path — kept for redirects */
export const AUTOMATE_LEGACY_BASE_PATH = '/platform/automate'

export function isAutomatePath(pathname: string | null): boolean {
  if (!pathname) return false
  return pathname === AUTOMATE_BASE_PATH || pathname.startsWith(`${AUTOMATE_BASE_PATH}/`)
}

/** Payments vault only — track & maintenance use Automate login alone. */
export function requiresCeoVaultAccess(pathname: string): boolean {
  return (
    pathname === AUTOMATE_PROJECTS_VAULT_PATH || pathname.startsWith(`${AUTOMATE_PROJECTS_VAULT_PATH}/`)
  )
}
