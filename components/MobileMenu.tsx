'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaInstagram, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import FloatingContactButton from './FloatingContactButton';
import { X, Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import WheelSuffix from './WheelSuffix'

// import { useState } from 'react' (verwijderd, want al aanwezig)

export default function MobileMenu() {
    // const [showSocial, setShowSocial] = useState<null | 'instagram' | 'linkedin'>(null) (verwijderd)
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const isHome = pathname === '/'

  useEffect(() => {
    setMounted(true)
  }, [])

  const targetSuffix = (() => {
    if (!pathname) return 'PHOTO'
    if (pathname === '/') return 'PHOTO'
    if (pathname === '/portfolio') return 'PORTFOLIO'
    if (pathname.startsWith('/portfolio/concerts')) return 'CONCERTS'
    if (pathname.startsWith('/portfolio/events')) return 'EVENTS'
    if (pathname.startsWith('/portfolio/misc')) return 'MISC'
    if (pathname === '/about') return 'ABOUT'
    if (pathname.startsWith('/admin')) return 'DOWNLOAD'
    if (pathname === '/not-found' || /^\/[a-zA-Z0-9-]+$/.test(pathname)) return 'DOWNLOAD'
    return 'PHOTO'
  })()

  const baseCycle = ['PORTFOLIO', 'CONCERTS', 'EVENTS', 'MISC', 'ABOUT', 'PHOTO', 'DOWNLOAD']
  const menuCycle = [...baseCycle.filter((s) => s !== targetSuffix), targetSuffix]


  return (
    <div className="md:hidden">
      <div className="flex justify-end items-center h-full pr-0">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className={
            isHome
              ? 'text-white rounded-md p-2 bg-black/25 hover:bg-black/35 active:bg-black/40 transition-colors'
              : 'text-black dark:text-white rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors'
          }
        >
          <Menu size={24} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-white dark:bg-black z-[80] flex flex-col items-center justify-center space-y-8 text-xl text-black dark:text-white">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 text-black dark:text-white"
            aria-label="Close menu"
          >
            <X size={28} />
          </button>

          {/* Logo: static on home, animated elsewhere */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-3xl tracking-tight text-black dark:text-white flex items-baseline mb-4"
            aria-label="Go to homepage"
          >
            <span className="font-extrabold">WOUTER</span>
            {!mounted ? (
              <span className="font-light inline-block opacity-0">.{targetSuffix}</span>
            ) : isHome ? (
              <span className="font-light inline-block opacity-90">.{targetSuffix}</span>
            ) : (
              <WheelSuffix cycle={menuCycle} intervalMs={360} className="font-light inline-block opacity-90" />
            )}
          </Link>

          <div className="flex flex-col items-center space-y-2">
  <Link href="/portfolio" onClick={() => setOpen(false)} className="text-lg font-medium">
    Portfolio
  </Link>
  <Link href="/portfolio/concerts" onClick={() => setOpen(false)} className="text-base text-gray-600 dark:text-gray-300">
    Concerts
  </Link>
  <Link href="/portfolio/events" onClick={() => setOpen(false)} className="text-base text-gray-600 dark:text-gray-300">
    Events
  </Link>
  <Link href="/portfolio/misc" onClick={() => setOpen(false)} className="text-base text-gray-600 dark:text-gray-300">
    Misc
  </Link>
</div>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>

          {/* Contact button/modal for mobile */}
          <div className="flex w-full justify-center items-center mt-4 mb-2 px-4">
            <FloatingContactButton mobile />
          </div>
          
          {/* Theme toggle button for mobile */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-base">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <div className="flex space-x-6 pt-4">
  <a href="https://instagram.com/woutervellekoop" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
    <FaInstagram size={20} />
  </a>
  <a href="https://linkedin.com/in/woutervellekoop" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
    <FaLinkedin size={20} />
  </a>
        {/* Social lightbox modal verwijderd */}
  <a href="mailto:hello@wouter.photo" onClick={() => setOpen(false)} aria-label="Email">
    <FaEnvelope size={20} />
  </a>
</div>
        </div>
      )}
    </div>
  )
}