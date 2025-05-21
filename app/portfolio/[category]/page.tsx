import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GalleryScroller from '../../../components/GalleryScroller';

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  return {
    title: `Portfolio - ${params.category}`,
  };
}

export default function PortfolioPage({
  params,
}: {
  params: { category: string };
}) {
  const { category } = params;

  const validCategories = ['concerts', 'events', 'misc', 'all'];
  if (!validCategories.includes(category)) {
    notFound();
  }

  return <GalleryScroller category={category as any} />;
}
