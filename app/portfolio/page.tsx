export const metadata = {
  title: "Portfolio – Wouter.Photo",
  description: "Explore the full photography portfolio of Wouter Vellekoop, covering concerts, events and more.",
}

import GalleryScroller from '../../components/GalleryScroller'

export default function PortfolioPage() {
  return <GalleryScroller category="all" />
}
