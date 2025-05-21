// app/portfolio/[category]/page.tsx

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GalleryScroller from '../../../components/GalleryScroller';

type Props = {
  params: {
    category: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Portfolio - ${params.category}`,
  };
}

export default function Page({ params }: Props) {
  const { category } = params;

  // Hier kun je eventueel checken of de categorie geldig is
  const validCategories = ['landscape', 'portrait', 'street']; // voorbeeld
  if (!validCategories.includes(category)) {
    notFound();
  }

  return <GalleryScroller category={category} />;
}
