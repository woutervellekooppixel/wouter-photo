'use client'

import { useEffect, useRef, useState } from 'react'
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

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current
    const item = container?.children[index] as HTMLElement
    if (item) {
      item.scrollIntoView({ behavior: 'smooth', inline: 'center' })
      setActiveIndex(index)
    }
  }

  const scrollLeft = () => {
    if (activeIndex > 0) scrollToIndex(activeIndex - 1)
  }

  const scrollRight = () => {
    if (activeIndex < filteredPhotos.length - 1) scrollToIndex(activeIndex + 1)
  }

  useEffect(() => {
    setActiveIndex(0)
  }, [category])

  return (
    <section className="relative w-full">
      {/* Navigatieknoppen (alleen desktop) */}
      {activeIndex > 0 && (
        <button
          onClick={scrollLeft}
          className="hidden xl:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100"
        >
          <ChevronLeft />
        </button>
      )}
      {activeIndex < filteredPhotos.length - 1 && (
        <button
          onClick={scrollRight}
          className="hidden xl:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100"
        >
          <ChevronRight />
        </button>
      )}

      {/* Desktop: horizontale scroll met locked height */}
      <div
        ref={scrollRef}
        className="hidden xl:flex h-[calc(100vh-96px)] w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth"
      >
        <div className="flex items-center h-full gap-x-4 px-4">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative flex-shrink-0 snap-center justify-center items-center max-w-[1200px] h-full w-[calc(100vw-32px)]"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                loading={index < 2 ? 'eager' : 'lazy'}
                className="object-contain"
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
              className="max-w-full max-h-[80vh] object-contain"
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
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  )
}