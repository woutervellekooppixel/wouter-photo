import Link from 'next/link'
import { Camera } from 'lucide-react'
import Header from '../components/Header'

export default function NotFound() {
  return (
    <>
      <Header />
      
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