import Link from 'next/link'
import { Camera, Sun, Moon } from 'lucide-react'
import { FaInstagram, FaLinkedin, FaEnvelope } from 'react-icons/fa'

export default function NotFound() {
  return (
    <>
      {/* Custom header with 404 logo */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white dark:bg-black dark:border-gray-700">
        <Link href="/portfolio" className="text-xl tracking-tight text-black dark:text-white flex items-baseline">
          <span className="font-extrabold">WOUTER</span>
          <span className="font-light">.404</span>
        </Link>

        <nav className="hidden sm:flex items-center space-x-6 text-sm text-black dark:text-white">
          <Link href="/portfolio" className="hover:text-gray-600 dark:hover:text-gray-300">Portfolio</Link>
          <Link href="/about" className="hover:text-gray-600 dark:hover:text-gray-300">About</Link>
          <a href="https://instagram.com/woutervellekoop" target="_blank" className="hover:text-gray-600 dark:hover:text-gray-300"><FaInstagram size={16} /></a>
          <a href="https://linkedin.com/in/woutervellekoop" target="_blank" className="hover:text-gray-600 dark:hover:text-gray-300"><FaLinkedin size={16} /></a>
          <a href="mailto:hello@wouter.photo" className="hover:text-gray-600 dark:hover:text-gray-300"><FaEnvelope size={16} /></a>
        </nav>
      </header>

      <main className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-black">
        <div className="max-w-md">
          {/* Camera icon with animation */}
          <div className="mb-8 inline-block animate-bounce">
            <Camera size={80} className="text-gray-300 dark:text-gray-700" strokeWidth={1} />
          </div>
          
          {/* 404 text */}
          <h1 className="text-8xl font-extrabold mb-4 text-black dark:text-white tracking-tight">
            404
          </h1>
          
          {/* Message */}
          <h2 className="text-2xl font-bold mb-3 text-black dark:text-white">
            Out of Focus
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            This page didn't make it into the frame. Let's get you back to the gallery.
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/portfolio" 
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Back to Portfolio
            </Link>
            <Link 
              href="/about" 
              className="px-6 py-3 border-2 border-black dark:border-white text-black dark:text-white font-medium rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              About Me
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}