// app/portfolio/[category]/page.tsx

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GalleryScroller from '../../../components/GalleryScroller';

interface PageProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Portfolio - ${params.category}`,
  };
}

export default function Page({ params }: PageProps) {
  const { category } = params;

  const validCategories = ['concerts', 'events', 'misc', 'all'];
  if (!validCategories.includes(category)) {
    notFound();
  }

  return <GalleryScroller category={category as any} />;
}
