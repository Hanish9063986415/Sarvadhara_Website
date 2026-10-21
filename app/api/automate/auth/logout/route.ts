import { NextResponse } from 'next/server'
import { AUTOMATE_SESSION_COOKIE } from '@/lib/automate-auth'
import { AUTOMATE_PROJECTS_SESSION_COOKIE } from '@/lib/automate-projects-auth'

const clearCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 0,
}

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(AUTOMATE_SESSION_COOKIE, '', clearCookie)
  response.cookies.set(AUTOMATE_PROJECTS_SESSION_COOKIE, '', clearCookie)
  return response
}
