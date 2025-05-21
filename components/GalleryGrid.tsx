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
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-6"
        style={{ maxWidth: 1200, margin: '0 auto' }}
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
            // 👇 dit is het enige dat nodig is:
            {...({} as React.HTMLAttributes<HTMLDivElement>)}
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