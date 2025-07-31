'use client'

import Image from 'next/image'
import { useState } from 'react'

type Props = {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  blurDataURL?: string
  sizes?: string
}

export default function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  fill, 
  className = '', 
  priority = false,
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const baseClasses = `transition-all duration-500 ease-in-out ${
    isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
  }`

  if (hasError) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-800 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image failed to load</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      priority={priority}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      sizes={sizes}
      quality={85} // Optimize quality/size balance
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      className={`${baseClasses} ${className}`}
    />
  )
}
