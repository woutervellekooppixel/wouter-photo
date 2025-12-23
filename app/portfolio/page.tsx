export const metadata = {
  title: "Portfolio – Wouter.Photo",
  description: "Explore the full photography portfolio of Wouter Vellekoop, covering concerts, events and more.",
}

import GalleryScroller from '../../components/GalleryScroller'
import { getGalleryData } from './gallery-data'

export default async function PortfolioPage() {
  const data = await getGalleryData()
  // Combine all categories for 'all'
  const photos = [...(data.concerts || []), ...(data.events || []), ...(data.misc || [])]
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <GalleryScroller category="all" photos={photos} />
    </div>
  )
}
