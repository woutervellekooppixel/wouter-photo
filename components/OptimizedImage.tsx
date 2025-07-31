'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import ImageSkeleton from './ImageSkeleton'

type Props = {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  containerClassName?: string
  aspectRatio?: string
  priority?: boolean
  blurDataURL?: string
  sizes?: string
  loading?: 'eager' | 'lazy'
  onClick?: () => void
  style?: React.CSSProperties
}

export default function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  fill = true, 
  className = '', 
  containerClassName = '',
  aspectRatio = 'aspect-[3/2]',
  priority = false,
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
  onClick,
  style
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer voor lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '100px', // Start loading 100px before image comes into view
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  if (hasError) {
    return (
      <div className={`relative ${aspectRatio} ${containerClassName}`}>
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={imgRef}
      className={`relative ${aspectRatio} ${containerClassName} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={style}
    >
      {/* Skeleton loader */}
      {!isLoaded && <ImageSkeleton aspectRatio={aspectRatio} />}
      
      {/* Actual image */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          fill={fill}
          priority={priority}
          loading={priority ? 'eager' : loading}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
          sizes={sizes}
          quality={90} // High quality for professional photos
          onLoad={handleLoad}
          onError={handleError}
          className={`
            transition-opacity duration-700 ease-in-out object-contain rounded-lg
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${className}
          `}
          // Enable modern formats automatically
          unoptimized={false}
        />
      )}
    </div>
  )
}
