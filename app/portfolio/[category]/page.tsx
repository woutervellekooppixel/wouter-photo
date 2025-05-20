// app/portfolio/[category]/page.tsx

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import GalleryScroller from '../../../components/GalleryScroller'

// ✅ Geldige categorieën (alleen deze zijn toegestaan)
const validCategories = ['concerts', 'events', 'misc'] as const
type Category = (typeof validCategories)[number]

// ✅ Pagina component
export default function CategoryPage({ params }: { params: { category: string } }) {
  if (!validCategories.includes(params.category as Category)) {
    notFound()
  }

  return (
    <GalleryScroller category={params.category as Category} />
  )
}

// ✅ Metadata functie (voor SEO per categorie)
export async function generateMetadata({
  params,
}: {
  params: { category: string }
}): Promise<Metadata> {
  const titles: Record<string, string> = {
    concerts: 'Concert Photography',
    events: 'Event Photography',
    misc: 'Miscellaneous Work',
  }

  const categoryTitle = titles[params.category] ?? 'Portfolio'

  return {
    title: `${categoryTitle} – Wouter.Photo`,
    description: `Browse ${categoryTitle.toLowerCase()} by Wouter Vellekoop, professional photographer based in the Netherlands.`,
  }
}