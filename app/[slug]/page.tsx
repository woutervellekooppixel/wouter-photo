import { notFound } from 'next/navigation';
import { getMetadata } from '@/lib/r2';
import DownloadGallery from './download-gallery';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const metadata = await getMetadata(slug);

  if (!metadata) {
    return {
      title: '404 - Not Found',
    };
  }

  return {
    title: metadata.title || slug,
    description: `Download ${metadata.files.length} bestanden`,
  };
}

export default async function DownloadPage({ params }: PageProps) {
  const { slug } = await params;
  const metadata = await getMetadata(slug);

  if (!metadata) {
    notFound();
  }


  return <DownloadGallery metadata={metadata} />;
}
