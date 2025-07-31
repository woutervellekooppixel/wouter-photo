import { notFound } from 'next/navigation';
import { generateMetadata } from './metadata';
import GalleryScroller from '../../../components/GalleryScroller';

export { generateMetadata };

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function PortfolioPage({ params }: PageProps) {
  const { category } = await params;

  const validCategories = ['concerts', 'events', 'misc', 'all'];
  if (!validCategories.includes(category)) {
    notFound();
  }

  const categoryTitles: Record<string, string> = {
    concerts: 'Concert Photography',
    events: 'Event Photography', 
    misc: 'Miscellaneous Photography',
    all: 'All Photography'
  };

  const categoryData = {
    concerts: {
      name: 'Concert Photography',
      description: 'Professional concert and live music photography capturing the energy and atmosphere of performances.',
    },
    events: {
      name: 'Event Photography',
      description: 'Professional event photography documenting corporate events, festivals, and special occasions.',
    },
    misc: {
      name: 'Miscellaneous Photography',
      description: 'Diverse photography work including portraits, landscapes, and creative projects.',
    }
  };

  const data = categoryData[category as keyof typeof categoryData];

  const structuredData = data ? {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: data.name,
    description: data.description,
    creator: {
      '@type': 'Person',
      name: 'Wouter Vellekoop',
      url: 'https://wouter.photo/about',
      jobTitle: 'Professional Photographer',
      knowsAbout: ['Concert Photography', 'Event Photography', 'Music Photography']
    },
    mainEntity: {
      '@type': 'CreativeWork',
      name: data.name,
      creator: 'Wouter Vellekoop',
      genre: category === 'concerts' ? 'Concert Photography' : category === 'events' ? 'Event Photography' : 'Photography'
    }
  } : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <div className="min-h-screen bg-white dark:bg-black">
        <GalleryScroller category={category as 'all' | 'concerts' | 'events' | 'misc'} />
      </div>
    </>
  );
}
