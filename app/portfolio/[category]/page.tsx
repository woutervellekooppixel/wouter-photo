import type { Metadata } from 'next'
import GalleryScroller from '../../../components/GalleryScroller'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
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

// ✅ Let op: dit is géén async functie
export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params

  if (!validCategories.includes(category as any)) {
    notFound()
  }

  return (
    <GalleryScroller category={category as 'concerts' | 'events' | 'misc'} />
  )
}