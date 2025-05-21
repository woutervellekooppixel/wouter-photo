// app/portfolio/[category]/page.tsx

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import GalleryScroller from '../../../components/GalleryScroller'

const validCategories = ['concerts', 'events', 'misc'] as const
type Category = typeof validCategories[number]

type PageProps = {
  params: {
    category: Category
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const titles: Record<Category, string> = {
    concerts: 'Concert Photography',
    events: 'Event Photography',
    misc: 'Miscellaneous Work',
  }

  return {
    title: `${titles[params.category]} – Wouter.Photo`,
    description: `Browse ${titles[params.category].toLowerCase()} by Wouter Vellekoop, professional photographer based in the Netherlands.`,
  }
}

export default function CategoryPage({ params }: PageProps) {
  if (!validCategories.includes(params.category)) {
    notFound()
  }

  return <GalleryScroller category={params.category} />
}