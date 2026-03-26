'use client'

import { useEffect } from 'react'

export default function SetHeaderHeightVar() {
  useEffect(() => {
    const root = document.documentElement

    const update = () => {
      const header = document.querySelector('header')
      const height = header instanceof HTMLElement ? header.getBoundingClientRect().height : 0
      root.style.setProperty('--header-h', `${Math.round(height)}px`)
    }

    update()

    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return null
}
