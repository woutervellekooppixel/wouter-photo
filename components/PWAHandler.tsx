'use client'

import { useEffect } from 'react'

export default function PWAHandler() {
  useEffect(() => {
    // Temporarily disabled service worker due to rendering issues
    console.log('PWA Service Worker temporarily disabled')
    /*
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }
    */
  }, [])

  return null
}
