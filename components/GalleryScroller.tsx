'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { photos } from '../data/photos'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import OptimizedImage from './OptimizedImage'

type Props = {
  category: 'concerts' | 'events' | 'misc' | 'all'
}

export default function GalleryScroller({ category }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const mobileScrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedPhotos, setDisplayedPhotos] = useState(photos)

  // Disable body scroll on desktop
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1280px)').matches
    if (isDesktop) {
      document.documentElement.classList.add('gallery-page')
      document.body.classList.add('gallery-page')
    }
    
    return () => {
      document.documentElement.classList.remove('gallery-page')
      document.body.classList.remove('gallery-page')
    }
  }, [])

  const filteredPhotos =
    category === 'all'
      ? photos
      : photos.filter((p) => p.category === category)

  // Smooth transition effect when category changes
  useEffect(() => {
    if (JSON.stringify(filteredPhotos) !== JSON.stringify(displayedPhotos)) {
      setIsTransitioning(true)
      
      // Start fade out
      setTimeout(() => {
        setDisplayedPhotos(filteredPhotos)
        setActiveIndex(0)
        
        // Reset scroll position
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'auto' })
        }
        if (mobileScrollRef.current) {
          mobileScrollRef.current.scrollTo({ left: 0, behavior: 'auto' })
        }
        
        // Start fade in
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 300) // 300ms fade out duration
    }
  }, [filteredPhotos, displayedPhotos])

  const getItemWidth = () => {
    const container = scrollRef.current
    if (!container) return 0
    
    // Get the actual photo container wrapper divs
    const photoItems = container.querySelectorAll(':scope > div > div')
    if (photoItems.length === 0) return 0
    
    const firstPhoto = photoItems[0] as HTMLElement
    const rect = firstPhoto.getBoundingClientRect()
    
    // Add gap between items (gap-x-4 = 16px)
    const gap = 16
    return rect.width + gap
  }

  const getMobileItemWidth = () => {
    const container = mobileScrollRef.current
    if (!container) return 0
    
    const firstPhoto = container.querySelector('div') as HTMLElement
    if (!firstPhoto) return 0
    
    return firstPhoto.offsetWidth + 16 // Include gap
  }

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current
    const mobileContainer = mobileScrollRef.current
    
    if (container) {
      const itemWidth = getItemWidth()
      if (itemWidth > 0) {
        const targetScroll = index * itemWidth
        container.scrollTo({ left: targetScroll, behavior: 'smooth' })
      } else {
        // Fallback: scroll by viewport width
        const fallbackWidth = window.innerWidth * 0.8
        const targetScroll = index * fallbackWidth
        container.scrollTo({ left: targetScroll, behavior: 'smooth' })
      }
    }
    
    if (mobileContainer) {
      const itemWidth = getMobileItemWidth()
      if (itemWidth > 0) {
        const targetScroll = index * itemWidth
        mobileContainer.scrollTo({ left: targetScroll, behavior: 'smooth' })
      }
    }
    
    setActiveIndex(index)
  }, [])

  const scrollLeft = useCallback(() => {
    const container = scrollRef.current
    if (container) {
      // Fixed scroll amount for exactly 1 photo movement
      container.scrollBy({ left: -600, behavior: 'smooth' })
    }
  }, [])

  const scrollRight = useCallback(() => {
    const container = scrollRef.current
    if (container) {
      // Fixed scroll amount for exactly 1 photo movement
      container.scrollBy({ left: 600, behavior: 'smooth' })
    }
  }, [])

  // Remove old category effect since we have smooth transition now

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
        const clampedIndex = Math.max(0, Math.min(newIndex, displayedPhotos.length - 1))
        
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
  }, [displayedPhotos.length, activeIndex])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Always prevent default and convert any scroll to horizontal
      e.preventDefault()
      
      // Very small fixed scroll amount
      const scrollDirection = e.deltaY > 0 ? 1 : -1
      const fixedScrollAmount = scrollDirection * 20 // Much smaller: 20px per scroll step
      container.scrollBy({ left: fixedScrollAmount, behavior: 'auto' })
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

  // Touch handlers for mobile
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      scrollRight()
    } else if (isRightSwipe) {
      scrollLeft()
    }
  }

  // Separate scroll handler for mobile
  useEffect(() => {
    const mobileContainer = mobileScrollRef.current
    if (!mobileContainer) return

    let scrollTimeout: NodeJS.Timeout

    const handleMobileScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const itemWidth = getMobileItemWidth()
        if (itemWidth === 0) return
        
        const scrollLeft = mobileContainer.scrollLeft
        const newIndex = Math.round(scrollLeft / itemWidth)
        const clampedIndex = Math.max(0, Math.min(newIndex, displayedPhotos.length - 1))
        
        if (clampedIndex !== activeIndex) {
          setActiveIndex(clampedIndex)
        }
      }, 150)
    }

    mobileContainer.addEventListener('scroll', handleMobileScroll, { passive: true })
    return () => {
      mobileContainer.removeEventListener('scroll', handleMobileScroll)
      clearTimeout(scrollTimeout)
    }
  }, [displayedPhotos.length, activeIndex])

  return (
    <section className="relative w-full bg-white dark:bg-black xl:h-screen xl:fixed xl:inset-0 xl:flex xl:items-center pt-4 sm:pt-6 xl:pt-6">
      <button
        onClick={scrollLeft}
        className="hidden xl:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100 dark:hover:bg-opacity-100 text-black dark:text-white"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={scrollRight}
        className="hidden xl:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100 dark:hover:bg-opacity-100 text-black dark:text-white"
      >
        <ChevronRight />
      </button>

      {/* Desktop: horizontaal scrollen */}
      <div
        ref={scrollRef}
        className={`hidden xl:flex h-full w-full overflow-x-auto overflow-y-hidden scrollbar-hide transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ height: 'calc(100vh - 80px)' }}
      >
        <div className="flex items-center h-full gap-x-4 px-4">
          {displayedPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative flex-shrink-0 max-w-[90vw]"
              style={{ 
                height: 'calc(100vh - 120px)',
                aspectRatio: '3/2'
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority={index < 2}
                loading={index < 2 ? 'eager' : 'lazy'}
                placeholder="blur"
                blurDataURL={photo.blurDataURL}
                className="object-contain transition-opacity duration-500 ease-in-out opacity-0 data-[loaded=true]:opacity-100"
                sizes="90vw"
                onLoad={(e: any) => {
                  e.currentTarget.dataset.loaded = 'true'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet: 2 kolommen */}
      <div className={`hidden sm:grid xl:hidden grid-cols-2 gap-6 px-4 sm:px-6 py-6 transition-opacity duration-300 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}>
        {displayedPhotos.map((photo) => (
          <div key={photo.id} className="flex justify-center items-center">
            <OptimizedImage
              src={photo.src}
              alt={photo.alt}
              blurDataURL={photo.blurDataURL}
              fill={false}
              width={1200}
              height={1800}
              priority={false}
              aspectRatio=""
              className="max-w-full max-h-[80vh] object-contain"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      {/* Mobiel: 1 kolom vertical scroll */}
      <div className={`sm:hidden w-full transition-opacity duration-300 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}>
        <div className="space-y-6 px-4 py-6">
          {displayedPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="w-full flex justify-center items-center"
            >
              <OptimizedImage
                src={photo.src}
                alt={photo.alt}
                blurDataURL={photo.blurDataURL}
                fill={false}
                width={1200}
                height={1800}
                priority={index < 3}
                aspectRatio=""
                className="max-w-full max-h-[70vh] object-contain"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}