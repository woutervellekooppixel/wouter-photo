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
    if (!container) return 0
    
    // Get the actual photo container, not just the first div
    const photoItems = container.querySelectorAll(':scope > div > div')
    if (photoItems.length === 0) return 0
    
    const firstPhoto = photoItems[0] as HTMLElement
    const rect = firstPhoto.getBoundingClientRect()
    
    // Add gap between items (4px * 2 for gap-x-4)
    const gap = 16 // 4px gap on each side
    return rect.width + gap
  }

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current
    if (!container) return
    
    const itemWidth = getItemWidth()
    if (itemWidth === 0) return
    
    const targetScroll = index * itemWidth
    
    container.scrollTo({ left: targetScroll, behavior: 'smooth' })
    setActiveIndex(index)
  }, [])

  const scrollLeft = useCallback(() => {
    const newIndex = Math.max(0, activeIndex - 1)
    scrollToIndex(newIndex)
  }, [activeIndex, scrollToIndex])

  const scrollRight = useCallback(() => {
    const newIndex = Math.min(filteredPhotos.length - 1, activeIndex + 1)
    scrollToIndex(newIndex)
  }, [activeIndex, filteredPhotos.length, scrollToIndex])

  useEffect(() => {
    setActiveIndex(0)
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'auto' })
    }
  }, [category])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      // Debounce scroll events to avoid conflicts with button clicks
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const itemWidth = getItemWidth()
        if (itemWidth === 0) return
        
        const scrollLeft = container.scrollLeft
        const newIndex = Math.round(scrollLeft / itemWidth)
        const clampedIndex = Math.max(0, Math.min(newIndex, filteredPhotos.length - 1))
        
        if (clampedIndex !== activeIndex) {
          setActiveIndex(clampedIndex)
        }
      }, 150) // Increased debounce time
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [filteredPhotos.length, activeIndex])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Always prevent default and convert any scroll to horizontal
      e.preventDefault()
      
      // Use deltaY (vertical scroll) to control horizontal movement
      const scrollAmount = e.deltaY || e.deltaX
      container.scrollBy({ left: scrollAmount, behavior: 'auto' })
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only arrow keys do precise 1-photo navigation
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        scrollRight()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        scrollLeft()
      }
    }

    // Prevent page scroll when hovering over gallery
    const handleMouseEnter = () => {
      document.body.style.overflow = 'hidden'
    }
    
    const handleMouseLeave = () => {
      document.body.style.overflow = 'auto'
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('mouseenter', handleMouseEnter)  
      container.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('keydown', handleKeyDown)
      // Restore scroll when component unmounts
      document.body.style.overflow = 'auto'
    }
  }, [scrollLeft, scrollRight])

  return (
    <section className="relative w-full bg-white dark:bg-black h-screen flex items-center pt-[80px]">
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
        className="hidden xl:flex h-[60vh] w-full overflow-x-auto overflow-y-hidden"
      >
        <div className="flex items-center h-full gap-x-4 px-4">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative flex-shrink-0 justify-center items-center aspect-[3/2] h-[60vh] max-w-[1200px]"
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