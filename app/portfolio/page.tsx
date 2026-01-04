export const metadata = {
  title: "Portfolio – Wouter.Photo",
  description: "Explore the full photography portfolio of Wouter Vellekoop, covering concerts, events and more.",
}

import GalleryScroller from '../../components/GalleryScroller'
import { getGalleryData } from './gallery-data'


export default async function PortfolioPage() {
  const data = await getGalleryData();
  // Combine all categories dynamically
  const photos = Object.values(data).flat();
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <GalleryScroller category="all" photos={photos} />
    </div>
  );
}
