import { notFound } from 'next/navigation'
import GalleryScroller from '../../../components/GalleryScroller'
import type { Metadata } from 'next'

const validCategories = ['concerts', 'events', 'misc'] as const
type Category = (typeof validCategories)[number]

type Props = {
  params: {
    category: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = params.category as Category

  if (!validCategories.includes(category)) {
    return {
      title: 'Wouter.Photo – Portfolio',
      description: 'Photography by Wouter Vellekoop',
    }
  }

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

export default function CategoryPage({ params }: Props) {
  const category = params.category as Category

  if (!validCategories.includes(category)) {
    notFound()
  }

  return <GalleryScroller category={category} />
}
