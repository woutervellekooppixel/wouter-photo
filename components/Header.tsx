'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaInstagram, FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import MobileMenu from './MobileMenu'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
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
  const { toggleCart, cart } = useCartStore()
  const itemCount = cart.length

  const isActive = (slug: string) => pathname === `/portfolio/${slug}`

  let suffix = 'PHOTO'
  if (pathname.startsWith('/portfolio/concerts')) suffix = 'CONCERTS'
  else if (pathname.startsWith('/portfolio/events')) suffix = 'EVENTS'
  else if (pathname.startsWith('/portfolio/misc')) suffix = 'MISC'

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <Link href="/portfolio" className="text-xl tracking-tight text-black flex items-baseline gap-1">
        <span className="font-extrabold">WOUTER</span>
        <AnimatePresence mode="wait">
          <MotionSpan
            key={suffix}
            className="font-light inline-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            .{suffix}
          </MotionSpan>
        </AnimatePresence>
      </Link>

      <nav className="hidden sm:flex items-center space-x-6 text-sm text-black">
        <div className="relative group">
          <div className="font-medium hover:text-black cursor-pointer">Portfolio</div>
          <div className="absolute left-0 top-full pt-1 z-50">
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 bg-white shadow-md rounded border border-gray-200 min-w-[140px] space-y-1 py-1 px-2">
              <Link href="/portfolio/concerts" className={`block text-sm py-1 ${isActive('concerts') ? 'font-semibold underline' : ''}`}>Concerts</Link>
              <Link href="/portfolio/events" className={`block text-sm py-1 ${isActive('events') ? 'font-semibold underline' : ''}`}>Events</Link>
              <Link href="/portfolio/misc" className={`block text-sm py-1 ${isActive('misc') ? 'font-semibold underline' : ''}`}>Misc</Link>
            </div>
          </div>
        </div>

        {/*  <Link href="/about" className="hover:text-gray-600">About</Link> */}
        <Link href="/shop" className="hover:text-gray-600">Shop</Link>

        <a href="https://instagram.com/woutervellekoop" target="_blank" className="hover:text-gray-600"><FaInstagram size={16} /></a>
        <a href="https://linkedin.com/in/woutervellekoop" target="_blank" className="hover:text-gray-600"><FaLinkedin size={16} /></a>
        <a href="mailto:hello@wouter.photo" className="hover:text-gray-600"><FaEnvelope size={16} /></a>

        {/* 🛒 Winkelwagen */}
        {/*  <button onClick={() => toggleCart(true)} className="relative hover:text-gray-600">
          <ShoppingCart size={18} />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-black text-white text-xs px-1 rounded-full">
              {itemCount}
            </span>
          )}
        </button> */}
      </nav>

      <div className="sm:hidden">
        <MobileMenu />
      </div>
    </header>
  )
}