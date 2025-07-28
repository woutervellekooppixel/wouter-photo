'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { photos } from '../data/photos'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

type Props = {
  category: 'concerts' | 'events' | 'misc' | 'all'
}

export default function GalleryScroller({ category }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const filteredPhotos =
    category === 'all'
      ? photos
      : photos.filter((p) => p.category === category)

  const getItemWidth = () => {
    const container = scrollRef.current
    const firstItem = container?.querySelector(':scope > div > div:first-child') as HTMLElement
    return firstItem?.getBoundingClientRect().width || 0
  }

  const scrollLeft = useCallback(() => {
    const container = scrollRef.current
    const scrollAmount = getItemWidth()
    if (container) {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }, [])

  const scrollRight = useCallback(() => {
    const container = scrollRef.current
    const scrollAmount = getItemWidth()
    if (container) {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    setActiveIndex(0)
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'auto' })
    }
  }, [category])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const itemWidth = getItemWidth()
      const newIndex = Math.round(container.scrollLeft / itemWidth)
      setActiveIndex(Math.max(0, Math.min(newIndex, filteredPhotos.length - 1)))
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [filteredPhotos.length])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        container.scrollBy({ left: e.deltaY, behavior: 'smooth' })
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') scrollRight()
      else if (e.key === 'ArrowLeft') scrollLeft()
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [scrollLeft, scrollRight])

  return (
    <section className="relative w-full bg-white dark:bg-black">
      {activeIndex > 0 && (
        <button
          onClick={scrollLeft}
          className="hidden xl:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100 dark:hover:bg-opacity-100 text-black dark:text-white"
        >
          <ChevronLeft />
        </button>
      )}
      {activeIndex < filteredPhotos.length - 1 && (
        <button
          onClick={scrollRight}
          className="hidden xl:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100 dark:hover:bg-opacity-100 text-black dark:text-white"
        >
          <ChevronRight />
        </button>
      )}

      {/* Desktop: horizontaal scrollen */}
      <div
        ref={scrollRef}
        className="hidden xl:flex h-[calc(100vh-96px)] w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth"
      >
        <div className="flex items-center h-full gap-x-4 px-4">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative flex-shrink-0 snap-center justify-center items-center aspect-[3/2] h-[calc(100vh-96px)] max-w-[1200px]"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                loading={index < 2 ? 'eager' : 'lazy'}
                placeholder="blur"
                blurDataURL={photo.blurDataURL}
                onLoad={(e) => {
                  e.currentTarget.dataset.loaded = 'true'
                }}
                className="object-contain transition-opacity duration-500 ease-in-out opacity-0 data-[loaded=true]:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet: 2 kolommen */}
      <div className="hidden sm:grid xl:hidden grid-cols-2 gap-6 px-4 sm:px-6 py-6">
        {filteredPhotos.map((photo) => (
          <div key={photo.id} className="flex justify-center items-center">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={1200}
              height={1800}
              loading="lazy"
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              onLoad={(e) => {
                e.currentTarget.dataset.loaded = 'true'
              }}
              className="max-w-full max-h-[80vh] object-contain transition-opacity duration-500 ease-in-out opacity-0 data-[loaded=true]:opacity-100"
            />
          </div>
        ))}
      </div>

      {/* Mobiel: 1 kolom */}
      <div className="grid sm:hidden grid-cols-1 gap-6 px-4 py-6">
        {filteredPhotos.map((photo) => (
          <div key={photo.id} className="flex justify-center items-center">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={800}
              height={1200}
              loading="lazy"
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              onLoad={(e) => {
                e.currentTarget.dataset.loaded = 'true'
              }}
              className="max-w-full max-h-[80vh] object-contain transition-opacity duration-500 ease-in-out opacity-0 data-[loaded=true]:opacity-100"
            />
          </div>
        ))}
      </div>
    </section>
  )
}