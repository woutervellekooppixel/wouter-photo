'use client'
import { useRef } from 'react'
import { photos } from '../data/photos'
import { motion, AnimatePresence, MotionProps } from 'framer-motion'
import Image from 'next/image'
import { HTMLAttributes } from 'react'

type GalleryScrollerProps = {
  category: 'concerts' | 'events' | 'misc' | 'all'
}

// ✅ Combineer HTMLProps en MotionProps netjes
type DivWithMotionProps = HTMLAttributes<HTMLDivElement> & MotionProps
const MotionDiv = motion<HTMLDivElement>(function MotionDivBase(props: DivWithMotionProps) {
  return <div {...props} />
})

export default function GalleryScroller({ category }: GalleryScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredPhotos =
    category === 'all' ? photos : photos.filter((p) => p.category === category)

  return (
    <div className="overflow-x-auto whitespace-nowrap px-4 py-6" ref={containerRef}>
      <AnimatePresence mode="popLayout">
        <MotionDiv layout key={category} className="flex gap-4">
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
        </MotionDiv>
      </AnimatePresence>
    </div>
  )
}