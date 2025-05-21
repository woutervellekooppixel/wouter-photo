'use client'

import { useEffect, useRef, useState, HTMLAttributes } from 'react'
import { motion, AnimatePresence, MotionProps } from 'framer-motion'
import { photos } from '../data/photos'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  category: 'concerts' | 'events' | 'misc' | 'all'
}

// ✅ Helper om motion.div correct te gebruiken zonder type errors
const MotionDiv = motion(function MotionDivBase({
  className,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} style={style} {...rest} />
})

export default function GalleryScroller({ category }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const filteredPhotos =
    category === 'all'
      ? photos
      : photos.filter((p) => p.category === category)

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current
    const item = container?.children[0]?.children[index] as HTMLElement
    if (item) {
      item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
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
    <section className="relative py-6 sm:py-8">
      {/* Pijlen desktop */}
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

      {/* Desktop: horizontale scroll */}
      <div
        className="hidden xl:flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-2 px-4"
        ref={scrollRef}
      >
        <AnimatePresence mode="popLayout">
          <MotionDiv layout className="flex gap-2" key={category}>
            {filteredPhotos.map((photo, index) => (
              <MotionDiv
                key={photo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: index * 0.02,
                }}
                className="flex-shrink-0 snap-center bg-white flex justify-center items-center"
                style={{
                  width: 'calc(100vw - 10vw)',
                  maxWidth: '1200px',
                  height: 'calc(100vh - 96px)',
                  marginTop: '18px',
                  marginBottom: '18px',
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={9999}
                  height={9999}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  className="max-h-full max-w-full object-contain"
                />
              </MotionDiv>
            ))}
          </MotionDiv>
        </AnimatePresence>
      </div>

      {/* Tablet: 2 kolommen */}
      <div className="hidden sm:grid xl:hidden grid-cols-2 gap-6 px-6">
        {filteredPhotos.map((photo, index) => (
          <div key={photo.id} className="flex justify-center items-center">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={9999}
              height={9999}
              loading="lazy"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        ))}
      </div>

      {/* Mobiel: 1 kolom */}
      <div className="grid sm:hidden grid-cols-1 gap-6 px-4">
        {filteredPhotos.map((photo, index) => (
          <div key={photo.id} className="flex justify-center items-center">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={9999}
              height={9999}
              loading="lazy"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  )
}