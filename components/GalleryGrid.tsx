'use client'
import { useState } from 'react'
import { photos } from '../data/photos'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

type GalleryGridProps = {
  category: 'concerts' | 'events' | 'misc' | 'all'
}

export default function GalleryGrid({ category }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filteredPhotos =
    category === 'all' ? photos : photos.filter((p) => p.category === category)

  return (
    <>
      <div
        className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-6"
      >
        {filteredPhotos.map((photo, index) => (
          <div key={photo.id} className="cursor-pointer" onClick={() => setLightboxIndex(index)}>
            <Image
              src={photo.src}
              alt={photo.alt}
              width={1200}
              height={9999}
              className="w-full h-auto object-contain rounded"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
<motion.div
  className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  onClick={() => setLightboxIndex(null)}
  {...({
    onAnimationStart: undefined,
    onDragStart: undefined,
  } as any)}
>
            <Image
              src={filteredPhotos[lightboxIndex].src}
              alt={filteredPhotos[lightboxIndex].alt}
              width={1600}
              height={1200}
              className="max-h-[90vh] w-auto object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}