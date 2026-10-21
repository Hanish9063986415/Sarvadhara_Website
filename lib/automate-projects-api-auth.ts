import { cookies } from 'next/headers'
import { isAutomateAuthenticated } from '@/lib/automate-api-auth'
import { AUTOMATE_SESSION_COOKIE, verifySessionToken } from '@/lib/automate-auth'
import {
  AUTOMATE_PROJECTS_SESSION_COOKIE,
  verifyProjectsSessionToken,
} from '@/lib/automate-projects-auth'

export async function isCeoVaultAuthenticated(): Promise<boolean> {
  const store = cookies()
  const [mainOk, projectsOk] = await Promise.all([
    verifySessionToken(store.get(AUTOMATE_SESSION_COOKIE)?.value),
    verifyProjectsSessionToken(store.get(AUTOMATE_PROJECTS_SESSION_COOKIE)?.value),
  ])
  return mainOk && projectsOk
}

/** @deprecated Use isCeoVaultAuthenticated */
export const isProjectsSectionAuthenticated = isCeoVaultAuthenticated

export async function canAccessProjectWorkspaceData(): Promise<boolean> {
  return isAutomateAuthenticated()
}
