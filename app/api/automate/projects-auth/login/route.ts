import { NextResponse } from 'next/server'
import { isAutomateAuthenticated } from '@/lib/automate-api-auth'
import {
  AUTOMATE_PROJECTS_SESSION_COOKIE,
  createProjectsSessionToken,
  validateProjectsTeamCredentials,
} from '@/lib/automate-projects-auth'

export async function POST(request: Request) {
  if (!(await isAutomateAuthenticated())) {
    return NextResponse.json({ error: 'Automate session required.' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { username?: string; password?: string }
    const username = body.username ?? ''
    const password = body.password ?? ''

    if (!username || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const valid = await validateProjectsTeamCredentials(username, password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 })
    }

    const token = await createProjectsSessionToken()
    const response = NextResponse.json({ ok: true })
    response.cookies.set(AUTOMATE_PROJECTS_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Projects authentication unavailable.' }, { status: 503 })
  }
}
