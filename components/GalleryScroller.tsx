'use client'
import { useRef } from 'react'
import { photos } from '../data/photos'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

type GalleryScrollerProps = {
  category: 'concerts' | 'events' | 'misc' | 'all'
}

export default function GalleryScroller({ category }: GalleryScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredPhotos =
    category === 'all' ? photos : photos.filter((p) => p.category === category)

  return (
    <div className="overflow-x-auto whitespace-nowrap px-4 py-6" ref={containerRef}>
      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          key={category}
          {...({
            className: 'flex gap-4',
          } as React.HTMLAttributes<HTMLDivElement>)}
        >
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              layout
              className="flex-shrink-0 relative w-[80vw] sm:w-[400px] h-[600px] overflow-hidden rounded"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover rounded"
                sizes="(max-width: 640px) 80vw, 400px"
                loading="lazy"
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}