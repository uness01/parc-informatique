import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const ADMIN_ROUTES = ['/utilisateurs', '/profils']

// Modules TECHNICIEN cannot consult
const TECHNICIEN_BLOCKED_MODULES = ['/acquisitions', '/lots', '/articles', '/livraisons', '/societes']

// Create/edit routes requiring ADMIN or GESTIONNAIRE
const ADMIN_GEST_ADD_ROUTES = [
  '/acquisitions/nouveau', '/lots/nouveau', '/articles/nouveau',
  '/livraisons/nouveau', '/materiels/nouveau', '/affectations/nouvelle', '/societes/nouvelle',
]
const ADMIN_GEST_MODIFY_RE = /^\/(acquisitions|lots|articles|livraisons|materiels|affectations|societes)\/\d+\/modifier$/

// Create/edit routes requiring at least TECHNICIEN (CONSULTANT blocked)
const TECH_ABOVE_ADD_ROUTES = ['/pannes/nouvelle', '/reparations/nouvelle']
const TECH_ABOVE_MODIFY_RE  = /^\/(pannes|reparations)\/\d+\/modifier$/

function matches(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(route + '/')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = await getToken({ req: request })

  // ── /login: let unauthenticated through; bounce authenticated to dashboard ──
  if (pathname === '/login') {
    if (token) return NextResponse.redirect(new URL('/dashboard', request.url))
    return NextResponse.next()
  }

  // ── All other routes: require authentication ──────────────────────────────
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = (token as any).role as string || 'CONSULTANT'
  const forbidden = new URL('/acces-interdit', request.url)

  // ── Admin-only routes ─────────────────────────────────────────────────────
  if (ADMIN_ROUTES.some((r) => matches(pathname, r)) && role !== 'ADMIN') {
    return NextResponse.redirect(forbidden)
  }

  // ── TECHNICIEN: blocked from procurement/delivery modules ─────────────────
  if (role === 'TECHNICIEN' && TECHNICIEN_BLOCKED_MODULES.some((r) => matches(pathname, r))) {
    return NextResponse.redirect(forbidden)
  }

  // ── Create/edit routes requiring ADMIN or GESTIONNAIRE ───────────────────
  const isAdminGestRoute = ADMIN_GEST_ADD_ROUTES.includes(pathname) || ADMIN_GEST_MODIFY_RE.test(pathname)
  if (isAdminGestRoute && role !== 'ADMIN' && role !== 'GESTIONNAIRE') {
    return NextResponse.redirect(forbidden)
  }

  // ── Pannes/réparations create/edit requiring at least TECHNICIEN ─────────
  const isTechAboveRoute = TECH_ABOVE_ADD_ROUTES.includes(pathname) || TECH_ABOVE_MODIFY_RE.test(pathname)
  if (isTechAboveRoute && role === 'CONSULTANT') {
    return NextResponse.redirect(forbidden)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
