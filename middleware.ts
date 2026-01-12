import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')

  // Skip redirects for local development
  if (!host || host.includes('localhost') || host.startsWith('127.0.0.1')) {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname

  // Redirect root to portfolio, but don't fight Vercel's primary-domain redirects.
  // Host canonicalization should be configured in Vercel Domains to avoid redirect loops.
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/portfolio'
    return NextResponse.redirect(url, { status: 308 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next|.*\\..*|favicon.ico).*)',
  ],
}
