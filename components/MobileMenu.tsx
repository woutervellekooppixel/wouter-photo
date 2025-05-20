'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FaInstagram, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { X, Menu } from 'lucide-react'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(true)} className="text-black">
        <Menu size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center space-y-8 text-xl text-black">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 text-black"
            aria-label="Close menu"
          >
            <X size={28} />
          </button>

          <div className="flex flex-col items-center space-y-2">
  <Link href="/portfolio" onClick={() => setOpen(false)} className="text-lg font-medium">
    Portfolio
  </Link>
  <Link href="/portfolio/concerts" onClick={() => setOpen(false)} className="text-base text-gray-600">
    Concerts
  </Link>
  <Link href="/portfolio/events" onClick={() => setOpen(false)} className="text-base text-gray-600">
    Events
  </Link>
  <Link href="/portfolio/misc" onClick={() => setOpen(false)} className="text-base text-gray-600">
    Misc
  </Link>
</div>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
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