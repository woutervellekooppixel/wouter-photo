import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background text-muted-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs sm:text-sm">© {new Date().getFullYear()} Wouter.Photo</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm">
            <Link className="underline underline-offset-4 hover:text-foreground" href="/terms-of-service">
              Terms
            </Link>
            <Link className="underline underline-offset-4 hover:text-foreground" href="/privacy-policy">
              Privacy
            </Link>
            <Link className="underline underline-offset-4 hover:text-foreground" href="/refund-policy">
              Refunds
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
