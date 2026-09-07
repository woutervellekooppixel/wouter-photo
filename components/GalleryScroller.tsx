'use client'

import { useCallback, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import type { Photo } from '@/lib/portfolioGallery'

type Props = { category: string; photos: Photo[] }

export default function GalleryScroller({ category, photos }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const displayedPhotos = category === 'all' ? photos : photos.filter((p) => p.category === category)

  // Keep the desktop scroll lock in sync when the viewport changes.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1280px)')
    const update = () => {
      document.documentElement.classList.toggle('gallery-page', query.matches)
      document.body.classList.toggle('gallery-page', query.matches)
    }
    update()
    query.addEventListener('change', update)
    return () => {
      query.removeEventListener('change', update)
      document.documentElement.classList.remove('gallery-page')
      document.body.classList.remove('gallery-page')
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: 'instant' })
  }, [category, photos])

  const scrollPhoto = useCallback((direction: number) => {
    const container = scrollRef.current
    if (!container || window.innerWidth < 1280) return
    const first = container.querySelector<HTMLElement>('[data-gallery-photo]')
    const distance = first ? first.getBoundingClientRect().width + 16 : window.innerWidth * 0.6
    container.scrollBy({
      left: direction * distance,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const handleWheel = (event: WheelEvent) => {
      if (window.innerWidth < 1280 || event.ctrlKey) return
      event.preventDefault()
      container.scrollLeft += Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX : event.deltaY * 2.5
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (window.innerWidth < 1280 || document.querySelector('[role="dialog"]')) return
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select'))) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollPhoto(event.key === 'ArrowRight' ? 1 : -1)
      }
    }
    container.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      container.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [scrollPhoto])

  return (
    <section aria-label="Photo gallery" className="relative w-full bg-white dark:bg-black xl:h-screen xl:fixed xl:inset-0 xl:flex xl:items-center xl:pt-16">
      <button onClick={() => scrollPhoto(-1)} aria-label="Previous photo"
        className="hidden xl:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100 dark:hover:bg-opacity-100 text-black dark:text-white">
        <ChevronLeft />
      </button>
      <button onClick={() => scrollPhoto(1)} aria-label="Next photo"
        className="hidden xl:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100 dark:hover:bg-opacity-100 text-black dark:text-white">
        <ChevronRight />
      </button>
      {/* One image tree for all breakpoints: a mobile column, tablet grid,
          and desktop horizontal strip. Photo selection/order is unchanged. */}
      <div ref={scrollRef} className="w-full xl:h-[calc(100vh-80px)] xl:overflow-x-auto xl:overflow-y-hidden scrollbar-hide"
        onTouchStart={(event) => {
          if (window.innerWidth >= 1280) {
            touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
          }
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current
          touchStart.current = null
          if (!start || window.innerWidth < 1280 || !event.changedTouches[0]) return
          const dx = start.x - event.changedTouches[0].clientX
          const dy = start.y - event.changedTouches[0].clientY
          if (Math.max(Math.abs(dx), Math.abs(dy)) <= 50) return
          scrollPhoto(Math.abs(dy) > Math.abs(dx) ? 1 : dx > 0 ? 1 : -1)
        }}
        onTouchCancel={() => { touchStart.current = null }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 sm:px-6 py-6 xl:flex xl:items-center xl:h-full xl:gap-4 xl:px-4 xl:py-0">
          {displayedPhotos.map((photo, index) => (
            <div key={`${photo.category}/${photo.id}`} data-gallery-photo
              className="relative w-full aspect-[3/2] flex items-center justify-center bg-white dark:bg-black xl:w-auto xl:aspect-auto xl:flex-shrink-0 xl:max-w-[90vw] xl:h-[calc(100vh-120px)]">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={1600}
                height={1067}
                priority={index < 2}
                loading={index < 2 ? 'eager' : 'lazy'}
                {...(photo.blurDataURL ? { placeholder: 'blur' as const, blurDataURL: photo.blurDataURL } : {})}
                className="absolute inset-0 h-full w-full object-contain xl:static xl:w-auto xl:max-w-full transition-opacity duration-200 motion-reduce:transition-none opacity-0 data-[loaded=true]:opacity-100"
                sizes="(min-width: 1280px) 90vw, (min-width: 640px) 50vw, 100vw"
                onLoad={(event) => { event.currentTarget.dataset.loaded = 'true' }}
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
