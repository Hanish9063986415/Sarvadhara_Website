import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  AUTOMATE_BASE_PATH,
  AUTOMATE_LEGACY_BASE_PATH,
  AUTOMATE_PROJECTS_LOGIN_PATH,
  AUTOMATE_PROJECTS_PATH,
  AUTOMATE_PROJECTS_VAULT_PATH,
  requiresCeoVaultAccess,
} from '@/lib/automate-routes'
import { AUTOMATE_SESSION_COOKIE, verifySessionToken } from '@/lib/automate-auth'
import {
  AUTOMATE_PROJECTS_SESSION_COOKIE,
  verifyProjectsSessionToken,
} from '@/lib/automate-projects-auth'

const AUTOMATE_LOGIN_PATH = `${AUTOMATE_BASE_PATH}/login`

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (searchParams.has('automate')) {
    const url = request.nextUrl.clone()
    url.pathname = AUTOMATE_BASE_PATH
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith(AUTOMATE_LEGACY_BASE_PATH)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(AUTOMATE_LEGACY_BASE_PATH, AUTOMATE_BASE_PATH)
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith(AUTOMATE_BASE_PATH)) {
    const isLoginPage = pathname === AUTOMATE_LOGIN_PATH
    const session = request.cookies.get(AUTOMATE_SESSION_COOKIE)?.value
    const authenticated = await verifySessionToken(session)

    if (isLoginPage && authenticated) {
      return NextResponse.redirect(new URL(AUTOMATE_BASE_PATH, request.url))
    }

    if (!isLoginPage && !authenticated) {
      const loginUrl = new URL(AUTOMATE_LOGIN_PATH, request.url)
      if (pathname !== AUTOMATE_BASE_PATH) {
        loginUrl.searchParams.set('next', pathname)
      }
      return NextResponse.redirect(loginUrl)
    }

    if (authenticated && pathname.startsWith(AUTOMATE_PROJECTS_PATH)) {
      const isProjectsLogin = pathname === AUTOMATE_PROJECTS_LOGIN_PATH
      const projectsSession = request.cookies.get(AUTOMATE_PROJECTS_SESSION_COOKIE)?.value
      const vaultAuthenticated = await verifyProjectsSessionToken(projectsSession)

      if (isProjectsLogin) {
        if (vaultAuthenticated) {
          const next = request.nextUrl.searchParams.get('next')
          const dest =
            next && requiresCeoVaultAccess(next) ? next : AUTOMATE_PROJECTS_VAULT_PATH
          return NextResponse.redirect(new URL(dest, request.url))
        }
        return NextResponse.next()
      }

      // Vault, track, and maintenance stay open after Automate login.
      // Admin (CEO vault) session is required only to delete a project.
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
