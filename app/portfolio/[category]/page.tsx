// app/portfolio/[category]/page.tsx

import { notFound } from 'next/navigation'
import type { PageProps } from 'next'
import type { Metadata } from 'next'
import GalleryScroller from '../../../components/GalleryScroller'

const validCategories = ['concerts', 'events', 'misc'] as const
type Category = typeof validCategories[number]

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = params.category as Category

  const titles: Record<Category, string> = {
    concerts: 'Concert Photography',
    events: 'Event Photography',
    misc: 'Miscellaneous Work',
  }

  return {
    title: `${titles[category]} – Wouter.Photo`,
    description: `Browse ${titles[category].toLowerCase()} by Wouter Vellekoop, professional photographer based in the Netherlands.`,
  }
}

export default function CategoryPage({ params }: PageProps) {
  const category = params.category as Category

  if (!validCategories.includes(category)) {
    notFound()
  }

  return <GalleryScroller category={category} />
}