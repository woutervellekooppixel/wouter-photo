'use client'

import { FaInstagram, FaLinkedin, FaEnvelope } from 'react-icons/fa'

export default function BlogSidebar() {
  return (
    <aside className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-6">
      {/* Profile Image */}
      <div className="flex justify-center">
        <img
          src="/2022_NSJF-Fri_1179.jpg"
          alt="Wouter Vellekoop"
          className="w-24 h-24 rounded-full object-cover shadow-md"
        />
      </div>

      {/* About Content */}
      <div className="text-center">
        <h3 className="text-xl font-bold mb-3 text-black dark:text-white">
          Wouter Vellekoop
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Professional photographer specializing in concert, event, and advertising photography. 
          Capturing the raw energy of live performances and translating atmosphere into powerful visuals.
        </p>
        
        {/* Key Clients */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 text-black dark:text-white">
            Notable Clients
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            MOJO, Radio 538, North Sea Jazz, Ahoy', Talpa, BNN VARA, Residentie Orkest, UNICEF Nederland
          </p>
        </div>

        {/* Contact & Social */}
        <div className="space-y-3">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <a 
              href="mailto:hello@wouter.photo" 
              className="block hover:text-black dark:hover:text-white transition-colors"
            >
              hello@wouter.photo
            </a>
            <span className="block">+31 (0)6 16 290 418</span>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-4">
            <a 
              href="https://instagram.com/woutervellekoop" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram size={18} />
            </a>
            <a 
              href="https://linkedin.com/in/woutervellekoop" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={18} />
            </a>
            <a 
              href="mailto:hello@wouter.photo"
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Email"
            >
              <FaEnvelope size={18} />
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
