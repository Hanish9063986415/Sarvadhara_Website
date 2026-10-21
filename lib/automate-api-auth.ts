import { cookies } from 'next/headers'
import { AUTOMATE_SESSION_COOKIE, verifySessionToken } from '@/lib/automate-auth'

export async function isAutomateAuthenticated(): Promise<boolean> {
  const token = cookies().get(AUTOMATE_SESSION_COOKIE)?.value
  return verifySessionToken(token)
}
