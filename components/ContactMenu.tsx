'use client'

import { useState } from 'react'
import { ChevronDown, Mail, MessageCircle } from 'lucide-react'

export default function ContactMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2"
      >
        Hire Me
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-black shadow-lg rounded border border-gray-200 dark:border-gray-600 min-w-[200px] space-y-0 py-1"
          onMouseLeave={() => setIsOpen(false)}
        >
          <a
            href="mailto:hello@wouter.photo?subject=Photography Inquiry"
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            <Mail size={16} />
            <span>Email</span>
          </a>
          <a
            href="https://wa.me/31616290418?text=Hallo%20Wouter%2C%20ik%20ben%20ge%C3%AFnteresseerd%20in%20jouw%20fotografiediensten"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors border-t border-gray-200 dark:border-gray-700"
          >
            <MessageCircle size={16} />
            <span>WhatsApp</span>
          </a>
        </div>
      )}
    </div>
  )
}
