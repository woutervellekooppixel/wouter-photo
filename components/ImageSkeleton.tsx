'use client'

interface ImageSkeletonProps {
  className?: string
  aspectRatio?: string
}

export default function ImageSkeleton({ className = '', aspectRatio = 'aspect-[3/2]' }: ImageSkeletonProps) {
  return (
    <div className={`relative ${aspectRatio} ${className} bg-gray-200 dark:bg-gray-800 overflow-hidden rounded-lg`}>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer transform -skew-x-12"></div>
      </div>
    </div>
  )
}
