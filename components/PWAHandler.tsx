'use client'

import { useEffect } from 'react'

export default function PWAHandler() {
  useEffect(() => {
    // Temporarily disabled service worker due to rendering issues
    /*
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {})
        .catch((registrationError) => {
          console.error('SW registration failed: ', registrationError)
        })
    }
    */
  }, [])

  return null
}
