import { notFound } from 'next/navigation'
import GalleryScroller from '../../../components/GalleryScroller'

const validCategories = ['concerts', 'events', 'misc'] as const
type Category = (typeof validCategories)[number]

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = params.category as Category

  if (!validCategories.includes(category)) {
    notFound()
  }

  return <GalleryScroller category={category} />
}
