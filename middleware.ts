import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')

  // Skip redirects for local development
  if (!host || host.includes('localhost') || host.startsWith('127.0.0.1')) {
    return NextResponse.next()
  }

  const canonicalHost = 'wouter.photo'
  const pathname = request.nextUrl.pathname
  const search = request.nextUrl.search

  const isNonCanonicalHost = host === 'www.wouter.photo' || host === 'download.wouter.photo'
  const targetHost = isNonCanonicalHost ? canonicalHost : host
  const targetPathname = pathname === '/' ? '/portfolio' : pathname

  // Single-hop redirect to canonical host + non-root landing
  if (isNonCanonicalHost || pathname === '/') {
    return NextResponse.redirect(`https://${targetHost}${targetPathname}${search}`, { status: 308 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next|.*\\..*|favicon.ico).*)',
  ],
}
