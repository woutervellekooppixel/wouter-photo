// app/portfolio/[category]/page.tsx

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import GalleryScroller from '../../../components/GalleryScroller'

// ✅ Eerst constante met categorieën
const validCategories = ['concerts', 'events', 'misc'] as const
type Category = (typeof validCategories)[number]

// ✅ Daarna generateMetadata
export async function generateMetadata(
  { params }: { params: { category: string } }
): Promise<Metadata> {
  const titles: Record<Category, string> = {
    concerts: 'Concert Photography',
    events: 'Event Photography',
    misc: 'Miscellaneous Work',
  }

  const category = params.category as Category

  if (!validCategories.includes(category)) {
    return {
      title: 'Wouter.Photo – Portfolio',
      description: 'Photography by Wouter Vellekoop',
    }
  }

  return {
    title: `${titles[category]} – Wouter.Photo`,
    description: `Browse ${titles[category].toLowerCase()} by Wouter Vellekoop, professional photographer based in the Netherlands.`,
  }
}

// ✅ Helemaal onderaan: de page component
export default function CategoryPage(
  { params }: { params: { category: string } }
) {
  const category = params.category as Category

  if (!validCategories.includes(category)) {
    notFound()
  }

  return <GalleryScroller category={category} />
}