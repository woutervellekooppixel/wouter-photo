import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  const pathname = request.nextUrl.pathname

  // Skip redirects for local development
  if (!host || host.includes('localhost') || host.startsWith('127.0.0.1')) {
    return NextResponse.next()
  }

  // Avoid touching API routes or internal endpoints.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
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
