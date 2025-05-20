import { notFound } from 'next/navigation'
import type { Metadata, ResolvingMetadata } from 'next'
import GalleryScroller from '../../../components/GalleryScroller'

// Zorg dat de category types bekend zijn
const validCategories = ['concerts', 'events', 'misc'] as const
type Category = (typeof validCategories)[number]

type Props = {
  params: {
    category: string
  }
}

// ✅ Metadata functie volgens Next.js 15 regels
export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const titles: Record<string, string> = {
    concerts: 'Concert Photography',
    events: 'Event Photography',
    misc: 'Miscellaneous Work',
  }

  const title = titles[params.category] || 'Portfolio'

  return {
    title: `${title} – Wouter.Photo`,
    description: `Browse ${title.toLowerCase()} by Wouter Vellekoop, professional photographer based in the Netherlands.`,
  }
}

// ✅ De page zelf
export default function CategoryPage({ params }: Props) {
  const { category } = params

  if (!validCategories.includes(category as Category)) {
    notFound()
  }

  return <GalleryScroller category={category as Category} />
}