  "use client";
import Link from 'next/link'
import FloatingContactButton from './FloatingContactButton'
import { usePathname } from 'next/navigation'
import { FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa'
import { useEffect, useState } from 'react'
// import { SocialLightbox } from './SocialLightbox' (verwijderd)
import MobileMenu from './MobileMenu'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import WheelSuffix from './WheelSuffix'

export default function Header() {
  // Alle hooks altijd aanroepen!
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  // const [showSocial, setShowSocial] = useState<null | 'instagram' | 'linkedin'>(null) (verwijderd)

  const isHome = pathname === '/'

  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (slug: string) => pathname === `/portfolio/${slug}`

  // Determine which suffix we should end on for the current route.
  const targetSuffix = (() => {
    if (!pathname) return 'PHOTO'
    if (pathname === '/') return 'PHOTO'
    if (pathname === '/portfolio') return 'PORTFOLIO'
    if (pathname === '/portfolio/concerts') return 'CONCERTS'
    if (pathname === '/portfolio/events') return 'EVENTS'
    if (pathname === '/portfolio/misc') return 'MISC'
    if (pathname === '/plugins' || pathname.startsWith('/plugins/')) return 'PLUGINS'
    if (pathname === '/about') return 'ABOUT'
    if (pathname.startsWith('/admin')) return 'DOWNLOAD'
    if (pathname === '/not-found' || /^\/[a-zA-Z0-9-]+$/.test(pathname)) return 'DOWNLOAD'
    return 'PHOTO'
  })()

  const baseCycle = ['PORTFOLIO', 'CONCERTS', 'EVENTS', 'MISC', 'ABOUT', 'PHOTO', 'DOWNLOAD']
  const headerCycle = [...baseCycle.filter((s) => s !== targetSuffix), targetSuffix]


  return (
    <header
      className={
        isHome
          ? 'sticky top-0 z-[60] flex items-center px-6 py-4 pt-4 border-b border-transparent bg-transparent text-white'
          : 'sticky top-0 z-[60] flex items-center px-6 py-4 pt-4 border-b border-gray-200 bg-white dark:bg-black dark:border-gray-700'
      }
    >
      <Link
        href="/"
        className={`text-xl tracking-tight flex items-baseline ${isHome ? 'text-white' : 'text-black dark:text-white'}`}
      >
        <span className="font-extrabold">WOUTER</span>
        {!mounted ? (
          <span className="font-light inline-block opacity-0">.{targetSuffix}</span>
        ) : isHome ? (
          <span className="font-light inline-block opacity-90">.{targetSuffix}</span>
        ) : (
          <WheelSuffix cycle={headerCycle} intervalMs={380} className="font-light inline-block opacity-90" />
        )}
      </Link>

      {/* Spacer keeps the nav on the right without showing DownloadStats */}
      <div className="hidden md:flex flex-1" aria-hidden="true" />

      <nav
        className={`hidden md:flex items-center space-x-6 text-sm flex-shrink-0 ${
          isHome ? 'text-white' : 'text-black dark:text-white'
        }`}
      >
        <div className="relative group">
          <Link
            href="/portfolio"
            className={`font-medium ${
              isHome ? 'hover:text-white/80' : 'hover:text-black dark:hover:text-white'
            }`}
          >
            Portfolio
          </Link>
          <div className="absolute left-0 top-full pt-1 z-50">
            <div
              className={
                isHome
                  ? 'invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 bg-black/60 text-white shadow-2xl rounded border border-white/20 min-w-[140px] space-y-1 py-1 px-2 backdrop-blur-md'
                  : 'invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-black shadow-md rounded border border-gray-200 dark:border-gray-600 min-w-[140px] space-y-1 py-1 px-2'
              }
            >
              <Link
                href="/portfolio/concerts"
                className={`block text-sm py-1 ${isActive('concerts') ? 'font-semibold underline' : ''}`}
              >
                Concerts
              </Link>
              <Link
                href="/portfolio/events"
                className={`block text-sm py-1 ${isActive('events') ? 'font-semibold underline' : ''}`}
              >
                Events
              </Link>
              <Link
                href="/portfolio/misc"
                className={`block text-sm py-1 ${isActive('misc') ? 'font-semibold underline' : ''}`}
              >
                Misc
              </Link>
            </div>
          </div>
        </div>


        <Link
          href="/about"
          className={isHome ? 'hover:text-white/80' : 'hover:text-gray-600 dark:hover:text-gray-300'}
        >
          About
        </Link>


        <a
          href="https://instagram.com/woutervellekoop"
          target="_blank"
          rel="noopener noreferrer"
          className={isHome ? 'hover:text-white/80' : 'hover:text-gray-600 dark:hover:text-gray-300'}
          aria-label="Instagram"
        >
          <FaInstagram size={16} />
        </a>
        <a
          href="https://linkedin.com/in/woutervellekoop"
          target="_blank"
          rel="noopener noreferrer"
          className={isHome ? 'hover:text-white/80' : 'hover:text-gray-600 dark:hover:text-gray-300'}
          aria-label="LinkedIn"
        >
          <FaLinkedin size={16} />
        </a>
        <a
          href="https://wa.me/31616290418?text=Hallo%20Wouter%2C%20ik%20ben%20ge%C3%AFnteresseerd%20in%20jouw%20fotografiediensten"
          target="_blank"
          className={isHome ? 'hover:text-white/80' : 'hover:text-gray-600 dark:hover:text-gray-300'}
        >
          <FaWhatsapp size={16} />
        </a>

        {/* Theme toggle button */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`${isHome ? 'hover:text-white/80' : 'hover:text-gray-600 dark:hover:text-gray-300'} transition-colors`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>

      {/* Contact button helemaal rechts */}
      <div className="hidden md:flex flex-shrink-0 ml-4">
        <FloatingContactButton variant={isHome ? 'home' : 'default'} />
      </div>

      <div className="md:hidden flex-1 flex justify-end items-center h-full pr-0" style={{minHeight: 'inherit'}}>
        <MobileMenu />
      </div>

    </header>
  )
}