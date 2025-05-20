import { Metadata } from 'next'

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

import GalleryScroller from '../../../components/GalleryScroller'
import { notFound } from 'next/navigation'

type Props = {
  params: {
    category: string
  }
}

const validCategories = ['concerts', 'events', 'misc'] as const

export default function CategoryPage({ params }: Props) {
  if (!validCategories.includes(params.category as any)) {
    notFound()
  }

  return (
    <GalleryScroller category={params.category as 'concerts' | 'events' | 'misc'} />
  )
}
