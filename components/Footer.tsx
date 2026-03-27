"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  if (pathname === '/shop' || pathname.startsWith('/shop/')) {
    return null
  }

  return (
    <footer className="border-t border-border bg-background text-muted-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs sm:text-sm">© {new Date().getFullYear()} Wouter.Photo</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm">
            <Link className="underline underline-offset-4 hover:text-foreground" href="/algemene-voorwaarden">
              Algemene voorwaarden
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
