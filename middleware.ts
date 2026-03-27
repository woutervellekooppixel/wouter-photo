import { NextRequest, NextResponse } from 'next/server'

// Multi-segment paths that should not be indexed
const NOINDEX_PATHS: string[] = []

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  const pathname = request.nextUrl.pathname

  // Skip for local development
  if (!host || host.includes('localhost') || host.startsWith('127.0.0.1')) {
    return NextResponse.next()
  }

  // Leave API routes alone
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Legacy/removed route: always redirect.
  if (pathname === '/preview-home') {
    return NextResponse.redirect(new URL('/', request.url), 308)
  }

  const response = NextResponse.next()

  // Explicit noindex for private multi-segment pages
  if (NOINDEX_PATHS.some((p) => pathname.startsWith(p))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex')
    return response
  }

  // Noindex for root-level download slugs (e.g. /some-gallery-slug)
  // Keep known public single-segment pages indexable.
  const rootSlugMatch = pathname.match(/^\/([a-z0-9-]+)$/i)
  const rootSegment = rootSlugMatch?.[1]?.toLowerCase()

  const isPublicSingleSegment =
    rootSegment === 'about' ||
    rootSegment === 'portfolio' ||
    rootSegment === 'plugins' ||
    rootSegment === 'shop' ||
    rootSegment === 'contact' ||
    rootSegment === 'algemene-voorwaarden'

  const isDownloadSlug = Boolean(rootSegment) && !isPublicSingleSegment

  if (isDownloadSlug) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next|api|.*\\..*|favicon.ico).*)',
  ],
}
