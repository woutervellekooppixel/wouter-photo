import { useEffect, useRef, useState } from 'react'

export function useInView(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold])

  return { ref, isInView }
}

export function useVisibilityPreloader(photos: any[], activeIndex: number, preloadCount = 3) {
  useEffect(() => {
    // Preload next few images when they're about to come into view
    const imagesToPreload = photos.slice(
      Math.max(0, activeIndex - 1), 
      Math.min(photos.length, activeIndex + preloadCount + 1)
    )

    imagesToPreload.forEach((photo) => {
      const img = new Image()
      img.src = photo.src
    })
  }, [activeIndex, photos, preloadCount])
}
