import { notFound } from 'next/navigation';
import { getMetadata } from '@/lib/r2';
import DownloadGallery from './download-gallery';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const metadata = await getMetadata(slug);

  if (!metadata) {
    return {
      title: '404 - Not Found',
    };
  }

  const title = metadata.title || slug;
  const description = `Download ${metadata.files.length} bestanden`;

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const baseUrl = host
    ? `${proto}://${host}`
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wouter.download');
  const ogImageUrl = metadata.previewImageKey
    ? `${baseUrl}/api/photos/by-key?key=${encodeURIComponent(metadata.previewImageKey)}`
    : `${baseUrl}/api/background/default-background`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${encodeURIComponent(slug)}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
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
