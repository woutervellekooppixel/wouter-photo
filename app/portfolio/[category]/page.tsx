import type { Metadata, PageProps } from 'next'
import GalleryScroller from '../../../components/GalleryScroller'
import { notFound } from 'next/navigation'

// ✅ Correct getype: gebruikt standaard Next's PageProps
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const titles: Record<string, string> = {
    concerts: 'Concert Photography',
    events: 'Event Photography',
    misc: 'Miscellaneous Work',
  }

  const categoryTitle = titles[params.category] || 'Portfolio'

  return {
    title: `${categoryTitle} – Wouter.Photo`,
    description: `Browse ${categoryTitle.toLowerCase()} by Wouter Vellekoop, professional photographer based in the Netherlands.`,
  }
}

const validCategories = ['concerts', 'events', 'misc'] as const

export default function CategoryPage({ params }: { params: { category: string } }) {
  if (!validCategories.includes(params.category as any)) {
    notFound()
  }

  return (
    <GalleryScroller category={params.category as 'concerts' | 'events' | 'misc'} />
  )
}