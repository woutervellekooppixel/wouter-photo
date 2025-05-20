import { notFound } from 'next/navigation'
import GalleryScroller from '../../../components/GalleryScroller'
import type { Metadata } from 'next'

const validCategories = ['concerts', 'events', 'misc'] as const
type Category = (typeof validCategories)[number]

type PageProps = {
  params: {
    category: Category
  }
}

// ✅ SEO metadata poging 3
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const titles: Record<Category, string> = {
    concerts: 'Concert Photography',
    events: 'Event Photography',
    misc: 'Miscellaneous Work',
  }

  const category = params.category
  return {
    title: `${titles[category]} – Wouter.Photo`,
    description: `Browse ${titles[category].toLowerCase()} by Wouter Vellekoop, professional photographer based in the Netherlands.`,
  }
}

// ✅ Pagina zelf
export default function CategoryPage({ params }: PageProps) {
  const category = params.category

  if (!validCategories.includes(category)) {
    notFound()
  }

  return <GalleryScroller category={category} />
}