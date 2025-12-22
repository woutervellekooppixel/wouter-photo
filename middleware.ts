import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')

  // Redirect from download.wouter.photo to www.wouter.photo (or wouter.photo)
  if (host?.includes('download.wouter.photo')) {
    const pathname = request.nextUrl.pathname
    const search = request.nextUrl.search
    
    return NextResponse.redirect(
      `https://www.wouter.photo${pathname}${search}`,
      { status: 301 } // Permanent redirect
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next|.*\\..*|favicon.ico).*)',
  ],
}
