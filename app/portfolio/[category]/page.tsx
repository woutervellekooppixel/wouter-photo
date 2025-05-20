import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GalleryScroller from '../../../components/GalleryScroller'

type Params = {
  category: string
}

const validCategories = ['concerts', 'events', 'misc'] as const

// ✅ Metadata-functie met correct type
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
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

// ✅ Page component
export default function CategoryPage({ params }: { params: Params }) {
  const { category } = params

  if (!validCategories.includes(category as any)) {
    notFound()
  }

  return (
    <GalleryScroller category={category as 'concerts' | 'events' | 'misc'} />
  )
}