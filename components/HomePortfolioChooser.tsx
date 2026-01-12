'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'

type Category = {
  key: string
  label: string
  href: string
}

type Props = {
  categories: Category[]
  buttonStyle?: CSSProperties
  buttonClassName?: string
}

export default function HomePortfolioChooser({
  categories,
  buttonStyle,
  buttonClassName,
}: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    const onMouseDown = (e: MouseEvent) => {
      const root = rootRef.current
      if (!root) return
      if (e.target instanceof Node && !root.contains(e.target)) setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('mousedown', onMouseDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={buttonStyle}
        className={`animate-in fade-in slide-in-from-bottom-3 duration-700 inline-flex items-center justify-center rounded-md border border-white/30 bg-white/10 px-6 py-3 text-white font-semibold backdrop-blur-md transition-colors hover:bg-white/20 ${buttonClassName ?? ''}`}
        aria-label="Open portfolio categories"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>Portfolio</span>
        <span className="ml-2 text-white/80" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Portfolio categories"
          className="animate-in fade-in zoom-in-95 duration-200 absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-md border border-white/25 bg-black/60 text-white shadow-2xl backdrop-blur-md"
        >
          <div className="px-3 py-2 text-xs uppercase tracking-[0.25em] text-white/70">
            Choose
          </div>

          <div className="h-px bg-white/15" />

          {categories.map((c) => (
            <Link
              key={c.key}
              href={c.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-semibold tracking-wide transition-colors hover:bg-white/10"
            >
              {c.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
