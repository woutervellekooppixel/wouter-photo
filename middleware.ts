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

  // Canonicalize host: redirect www.* and download.* to apex
  if (host === 'www.wouter.photo' || host === 'download.wouter.photo') {
    return NextResponse.redirect(`https://${canonicalHost}${pathname}${search}`, { status: 301 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next|.*\\..*|favicon.ico).*)',
  ],
}
