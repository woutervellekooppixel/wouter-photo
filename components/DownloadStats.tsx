'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatBytes } from '@/lib/utils'

type PublicFile = {
  size: number
}

type PublicMetadata = {
  filesCount?: number
  files?: PublicFile[]
}

export default function DownloadStats() {
  const pathname = usePathname()
  const [metadata, setMetadata] = useState<PublicMetadata | null>(null)
  const [loading, setLoading] = useState(false)

  // Detect if we're on a download page (single slug, not a known system route)
  const isDownloadPage = pathname && /^\/[a-zA-Z0-9-]+$/.test(pathname)

  useEffect(() => {
    if (!isDownloadPage) {
      setMetadata(null)
      return
    }

    const slug = pathname.slice(1) // Remove leading /
    
    const fetchMetadata = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/${encodeURIComponent(slug)}`)
        if (!response.ok) {
          setMetadata(null)
          return
        }

        const contentType = response.headers.get('content-type') ?? ''
        if (!contentType.includes('application/json')) {
          setMetadata(null)
          return
        }

        const publicMetadata: PublicMetadata = await response.json()
        setMetadata(publicMetadata)
      } catch (error) {
        console.error('Failed to fetch metadata:', error)
        setMetadata(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [pathname, isDownloadPage])

  if (!isDownloadPage || !metadata) return <div className="hidden md:flex items-center gap-2 text-xs text-gray-600" />

  const files = metadata.files ?? []
  const filesCount = metadata.filesCount ?? files.length
  const totalSize = files.reduce((acc, file) => acc + file.size, 0)

  return (
    <div className="hidden md:flex items-center gap-2 text-xs text-gray-600">
      <span>{filesCount} file{filesCount !== 1 ? 's' : ''}</span>
      <span className="text-gray-400">•</span>
      <span>{formatBytes(totalSize)}</span>
    </div>
  )
}
