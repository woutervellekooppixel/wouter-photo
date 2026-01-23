import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const proto = forwardedProto ?? request.nextUrl.protocol.replace(':', '')
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Skip redirects for local development
  if (!host || host.includes('localhost') || host.startsWith('127.0.0.1')) {
    return NextResponse.next()
  }

  // Avoid touching API routes or internal endpoints.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Canonical host: redirect www -> apex
  if (host === 'www.wouter.photo') {
    url.host = 'wouter.photo'
    return NextResponse.redirect(url, 308)
  }

  // Enforce HTTPS (best-effort behind proxies)
  if (proto && proto !== 'https') {
    url.protocol = 'https:'
    return NextResponse.redirect(url, 308)
  }

  // Normalize trailing slashes (avoid duplicate URLs)
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '')
    return NextResponse.redirect(url, 308)
  }

  // Normalize index.html
  if (url.pathname.endsWith('/index.html')) {
    url.pathname = url.pathname.replace(/\/index\.html$/, '') || '/'
    return NextResponse.redirect(url, 308)
  }

  const response = NextResponse.next()

  // Discourage indexing of download pages.
  // Download pages appear to be root-level slugs like /some-gallery-slug.
  // Keep public pages indexable.
  const isRootSlug = /^\/[a-z0-9-]+$/i.test(pathname)
  const isPublicSingleSegment = pathname === '/about' || pathname === '/portfolio'
  const isDownloadSlug = isRootSlug && !isPublicSingleSegment

  if (isDownloadSlug) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex')
  }

  if (pathname === '/preview-home') {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex')
  }

  return response
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next|api|.*\\..*|favicon.ico).*)',
  ],
}
