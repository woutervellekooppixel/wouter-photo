import { Metadata } from 'next'
import GalleryScroller from '../../../components/GalleryScroller'
import { notFound } from 'next/navigation'

type ValidCategory = 'concerts' | 'events' | 'misc'

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const titles: Record<ValidCategory, string> = {
    concerts: 'Concert Photography',
    events: 'Event Photography',
    misc: 'Miscellaneous Work',
  }

  const category = params.category as ValidCategory

  if (!Object.keys(titles).includes(category)) {
    return {
      title: 'Portfolio – Wouter.Photo',
      description: 'Photography by Wouter Vellekoop.',
    }
  }

  const categoryTitle = titles[category]

  return {
    title: `${categoryTitle} – Wouter.Photo`,
    description: `Browse ${categoryTitle.toLowerCase()} by Wouter Vellekoop, professional photographer based in the Netherlands.`,
  }
}

type Props = {
  params: {
    category: string
  }
}

const validCategories = ['concerts', 'events', 'misc'] as const

export default function CategoryPage({ params }: Props) {
  const { category } = params

  if (!validCategories.includes(category as ValidCategory)) {
    notFound()
  }

  return (
    <GalleryScroller category={category as ValidCategory} />
  )
}