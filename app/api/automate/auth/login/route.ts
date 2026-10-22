import { NextResponse } from 'next/server'
import {
  AUTOMATE_AUTH_SETUP_USER_MESSAGE,
  AUTOMATE_SESSION_COOKIE,
  createSessionToken,
  getAutomateAuthSetupError,
  validateAutomateCredentials,
} from '@/lib/automate-auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const setupError = getAutomateAuthSetupError()
  if (setupError) {
    console.error('[automate/auth/login] misconfigured:', setupError)
    return NextResponse.json({ error: AUTOMATE_AUTH_SETUP_USER_MESSAGE }, { status: 503 })
  }

  try {
    const body = (await request.json()) as { username?: string; password?: string }
    const username = body.username ?? ''
    const password = body.password ?? ''

    if (!username || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const valid = await validateAutomateCredentials(username, password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })
    }

    const token = await createSessionToken()
    const response = NextResponse.json({ ok: true })
    response.cookies.set(AUTOMATE_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (err) {
    console.error('[automate/auth/login]', err)
    return NextResponse.json(
      { error: 'Could not create a session. Check AUTOMATE_SESSION_SECRET on the server and redeploy.' },
      { status: 503 }
    )
  }
}
