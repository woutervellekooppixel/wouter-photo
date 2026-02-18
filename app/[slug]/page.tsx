import { notFound } from 'next/navigation';
import { getMetadata } from '@/lib/r2';
import DownloadGallery from './download-gallery';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import ExpiredRedirect from '@/components/ExpiredRedirect';
import { computeExpiresAtDate, isExpired } from '@/lib/expiry';

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

  if (isExpired(metadata)) {
    return {
      title: 'Link expired',
      description: 'This download is no longer available.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = metadata.title || slug;
  const description = `Download ${metadata.files.length} files`;
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

  if (isExpired(metadata)) {
    const expiresAt = computeExpiresAtDate(metadata);
    const destination = 'https://wouter.photo';
    return (
      <ExpiredRedirect
        destination={destination}
        title="This download has expired"
        description={
          expiresAt
            ? `This link expired on ${expiresAt.toLocaleDateString('en-US')}.`
            : 'This link has expired.'
        }
      />
    );
  }


  return <DownloadGallery metadata={metadata} />;
}
