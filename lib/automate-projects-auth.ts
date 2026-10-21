import { createSessionToken, verifySessionToken } from '@/lib/automate-auth'

export const AUTOMATE_PROJECTS_SESSION_COOKIE = 'automate_projects_session'

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export async function validateProjectsTeamCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUsername = process.env.AUTOMATE_PROJECTS_USERNAME
  const expectedPassword = process.env.AUTOMATE_PROJECTS_PASSWORD

  if (!expectedUsername || !expectedPassword) return false

  const normalizedInput = username.trim().toLowerCase()
  const normalizedExpected = expectedUsername.trim().toLowerCase()
  const userOk = timingSafeEqualString(normalizedInput, normalizedExpected)
  const passOk = timingSafeEqualString(password, expectedPassword)
  return userOk && passOk
}

export async function createProjectsSessionToken(): Promise<string> {
  return createSessionToken()
}

export async function verifyProjectsSessionToken(token: string | undefined): Promise<boolean> {
  return verifySessionToken(token)
}
