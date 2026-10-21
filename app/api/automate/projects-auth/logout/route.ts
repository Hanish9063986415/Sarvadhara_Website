import { NextResponse } from 'next/server'
import { AUTOMATE_PROJECTS_SESSION_COOKIE } from '@/lib/automate-projects-auth'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(AUTOMATE_PROJECTS_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
