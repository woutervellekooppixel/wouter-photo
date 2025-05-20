import { notFound } from 'next/navigation'
import GalleryScroller from '../../../components/GalleryScroller'
import type { Metadata } from 'next'

// Toegestane categorieën
const validCategories = ['concerts', 'events', 'misc'] as const
type Category = (typeof validCategories)[number]

// ✅ Type automatisch afleiden uit Next.js routing
export async function generateMetadata({ params }: { params: { category: Category } }): Promise<Metadata> {
  const titles: Record<Category, string> = {
    concerts: 'Concert Photography',
    events: 'Event Photography',
    misc: 'Miscellaneous Work',
  }

  const title = titles[params.category]
  return {
    title: `${title} – Wouter.Photo`,
    description: `Browse ${title.toLowerCase()} by Wouter Vellekoop, professional photographer based in the Netherlands.`,
  }
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = params.category as Category

  if (!validCategories.includes(category)) {
    notFound()
  }

  return <GalleryScroller category={category} />
}