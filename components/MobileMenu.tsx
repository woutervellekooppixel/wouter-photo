'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FaInstagram, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { X, Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()

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