'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { UploadMetadata } from '@/lib/r2'
import { formatBytes } from '@/lib/utils'

export default function DownloadStats() {
  const pathname = usePathname()
  const [metadata, setMetadata] = useState<UploadMetadata | null>(null)
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
        const response = await fetch(`/api/admin/uploads`)
        if (!response.ok) return
        
        const uploads: UploadMetadata[] = await response.json()
        const found = uploads.find(u => u.slug === slug)
        setMetadata(found || null)
      } catch (error) {
        console.error('Failed to fetch metadata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [pathname, isDownloadPage])

  // Hooks altijd aanroepen! Render een lege div als fallback.
  if (!isDownloadPage || !metadata) return <div className="hidden md:flex items-center gap-2 text-xs text-gray-600" />

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}-${month}`
  }

  const totalSize = metadata.files.reduce((acc, file) => acc + file.size, 0)

  return (
    <div className="hidden md:flex items-center gap-2 text-xs text-gray-600">
      <span>{metadata.files.length} bestand{metadata.files.length !== 1 ? 'en' : ''}</span>
      <span className="text-gray-400">•</span>
      <span>{formatBytes(totalSize)}</span>
      <span className="text-gray-400">•</span>
      <span>Beschikbaar tot {formatExpiryDate(metadata.expiresAt)}</span>
    </div>
  )
}
