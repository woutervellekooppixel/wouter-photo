// utils/useWindowWidth.ts
'use client'
import { useEffect, useState } from 'react'

export function useWindowWidth() {
  const [width, setWidth] = useState<number | null>(null)

  useEffect(() => {
    const updateSize = () => setWidth(window.innerWidth)
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return width
}