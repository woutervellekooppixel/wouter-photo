'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaInstagram, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { X, Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import type { HTMLAttributes } from 'react'

const MotionSpan = motion(function MotionSpanBase({
  className,
  style,
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return <span className={className} style={style} {...rest} />
})

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [currentSuffixIndex, setCurrentSuffixIndex] = useState(0)

  // Bepaal de suffixes op basis van de huidige pagina (zelfde logica als Header)
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
    } else {
      return ['PHOTO']
    }
  }

  const suffixes = getSuffixes()
  const currentSuffix = suffixes[currentSuffixIndex]

  // Cyclisch door de suffixes gaan en stoppen op de laatste (huidige pagina)
  useEffect(() => {
    if (!open || currentSuffixIndex >= suffixes.length - 1) return // Stop als menu niet open is of bij de laatste suffix

    const interval = setInterval(() => {
      setCurrentSuffixIndex((prevIndex) => {
        const nextIndex = prevIndex + 1
        if (nextIndex >= suffixes.length - 1) {
          return suffixes.length - 1
        }
        return nextIndex
      })
    }, 800)

    return () => clearInterval(interval)
  }, [suffixes.length, currentSuffixIndex, open])

  // Reset index wanneer pathname verandert of menu opent
  useEffect(() => {
    setCurrentSuffixIndex(0)
  }, [pathname, open])

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(true)} className="text-black dark:text-white">
        <Menu size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-white dark:bg-black z-50 flex flex-col items-center justify-center space-y-8 text-xl text-black dark:text-white">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 text-black dark:text-white"
            aria-label="Close menu"
          >
            <X size={28} />
          </button>

          {/* Animated Logo */}
          <div className="text-3xl tracking-tight text-black dark:text-white flex items-baseline mb-4">
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
          </div>

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
  <a href="https://instagram.com/woutervellekoop.nl" target="_blank" onClick={() => setOpen(false)} aria-label="Instagram">
    <FaInstagram size={20} />
  </a>
  <a href="https://linkedin.com/in/woutervellekoop" target="_blank" onClick={() => setOpen(false)} aria-label="LinkedIn">
    <FaLinkedin size={20} />
  </a>
  <a href="mailto:hello@wouter.photo" onClick={() => setOpen(false)} aria-label="Email">
    <FaEnvelope size={20} />
  </a>
</div>
        </div>
      )}
    </div>
  )
}