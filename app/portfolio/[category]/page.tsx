import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GalleryScroller from '../../../components/GalleryScroller';

export async function generateMetadata(
  context: any
): Promise<Metadata> {
  const category = context?.params?.category;
  return {
    title: `Portfolio - ${category}`,
  };
}

export default function PortfolioPage(
  context: any
) {
  const category = context?.params?.category;

  const validCategories = ['concerts', 'events', 'misc', 'all'];
  if (!validCategories.includes(category)) {
    notFound();
  }

  return <GalleryScroller category={category} />;
}
