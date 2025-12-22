'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaInstagram, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import MobileMenu from './MobileMenu'
import { Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import type { HTMLAttributes } from 'react'

const MotionSpan = motion(function MotionSpanBase({
  className,
  style,
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return <span className={className} style={style} {...rest} />
})

export default function Header() {
  const pathname = usePathname()
  const [currentSuffixIndex, setCurrentSuffixIndex] = useState(0)
  const { theme, setTheme } = useTheme()

  const isActive = (slug: string) => pathname === `/portfolio/${slug}`

  // Bepaal de suffixes op basis van de huidige pagina
  const getSuffixes = () => {
    if (pathname === '/') {
      return ['CONCERTS', 'EVENTS', 'MISC', 'PHOTO']
    } else if (pathname.startsWith('/portfolio/concerts')) {
      return ['PHOTO', 'EVENTS', 'MISC', 'CONCERTS']
    } else if (pathname.startsWith('/portfolio/events')) {
      return ['PHOTO', 'CONCERTS', 'MISC', 'EVENTS']
    } else if (pathname.startsWith('/portfolio/misc')) {
      return ['PHOTO', 'CONCERTS', 'EVENTS', 'MISC']
    } else if (pathname === '/about') {
      return ['PHOTO', 'CONCERTS', 'EVENTS', 'MISC', 'ABOUT']
    } else if (pathname === '/not-found' || !pathname.match(/^\/(portfolio|about)/)) {
      // 404 page or unknown route
      return ['PHOTO', 'CONCERTS', 'EVENTS', 'MISC', '404']
    } else {
      return ['PHOTO']
    }
  }

  const suffixes = getSuffixes()
  const currentSuffix = suffixes[currentSuffixIndex]

  // Cyclisch door de suffixes gaan en stoppen op de laatste (huidige pagina)
  useEffect(() => {
    if (currentSuffixIndex >= suffixes.length - 1) return // Stop als we bij de laatste zijn

    const interval = setInterval(() => {
      setCurrentSuffixIndex((prevIndex) => {
        const nextIndex = prevIndex + 1
        if (nextIndex >= suffixes.length - 1) {
          // Als we de laatste suffix bereiken, stop de interval
          return suffixes.length - 1
        }
        return nextIndex
      })
    }, 800)

    return () => clearInterval(interval)
  }, [suffixes.length, currentSuffixIndex])

  // Reset index wanneer pathname verandert
  useEffect(() => {
    setCurrentSuffixIndex(0)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white dark:bg-black dark:border-gray-700">
      <Link href="/portfolio" className="text-xl tracking-tight text-black dark:text-white flex items-baseline">
        <span className="font-extrabold">WOUTER</span>
        <AnimatePresence mode="wait">
          <MotionSpan
            key={currentSuffix}
            className="font-light inline-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            .{currentSuffix}
          </MotionSpan>
        </AnimatePresence>
      </Link>

      <nav className="hidden sm:flex items-center space-x-6 text-sm text-black dark:text-white">
        <div className="relative group">
          <div className="font-medium hover:text-black dark:hover:text-white cursor-pointer">Portfolio</div>
          <div className="absolute left-0 top-full pt-1 z-50">
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-black shadow-md rounded border border-gray-200 dark:border-gray-600 min-w-[140px] space-y-1 py-1 px-2">
              <Link href="/portfolio/concerts" className={`block text-sm py-1 ${isActive('concerts') ? 'font-semibold underline' : ''}`}>Concerts</Link>
              <Link href="/portfolio/events" className={`block text-sm py-1 ${isActive('events') ? 'font-semibold underline' : ''}`}>Events</Link>
              <Link href="/portfolio/misc" className={`block text-sm py-1 ${isActive('misc') ? 'font-semibold underline' : ''}`}>Misc</Link>
            </div>
          </div>
        </div>

        <Link href="/about" className="hover:text-gray-600 dark:hover:text-gray-300">About</Link>

        <a href="https://instagram.com/woutervellekoop" target="_blank" className="hover:text-gray-600 dark:hover:text-gray-300"><FaInstagram size={16} /></a>
        <a href="https://linkedin.com/in/woutervellekoop" target="_blank" className="hover:text-gray-600 dark:hover:text-gray-300"><FaLinkedin size={16} /></a>
        <a href="mailto:hello@wouter.photo" className="hover:text-gray-600 dark:hover:text-gray-300"><FaEnvelope size={16} /></a>

        {/* Theme toggle button */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Hire Me button */}
        <a 
          href="mailto:hello@wouter.photo?subject=Photography Inquiry"
          className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Hire Me
        </a>
      </nav>

      <div className="sm:hidden">
        <MobileMenu />
      </div>
    </header>
  )
}