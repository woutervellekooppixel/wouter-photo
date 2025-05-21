// app/portfolio/[category]/page.tsx

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GalleryScroller from '../../../components/GalleryScroller';

interface PortfolioPageParams {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: PortfolioPageParams): Promise<Metadata> {
  return {
    title: `Portfolio - ${params.category}`,
  };
}

export default function PortfolioPage({ params }: PortfolioPageParams) {
  const { category } = params;

  const validCategories = ['concerts', 'events', 'misc', 'all'];
  if (!validCategories.includes(category)) {
    notFound();
  }

  return <GalleryScroller category={category as any} />;
}
