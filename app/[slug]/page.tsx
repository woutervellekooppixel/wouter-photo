import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getMetadata } from '@/lib/r2';
import DownloadGallery from './download-gallery';

const getCachedMetadata = cache(getMetadata);
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import ExpiredRedirect from '@/components/ExpiredRedirect';
import { computeExpiresAtDate, computeExpiresAtIso, isExpired } from '@/lib/expiry';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const metadata = await getCachedMetadata(slug);

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
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://download.wouter.photo');
  // Verkleinde webp voor social previews — nooit het originele bestand.
  // Designleveringen (useDefaultHero) tonen ook in de link-preview de
  // standaard-achtergrond i.p.v. een bestand uit de transfer.
  const ogImageUrl = metadata.previewImageKey && !metadata.useDefaultHero
    ? `${baseUrl}/api/thumbnail/${encodeURIComponent(slug)}?key=${encodeURIComponent(metadata.previewImageKey)}&w=1920`
    : `${baseUrl}/api/background/default-background`;

  return {
    // Absolute titel: geen "| Wouter.Photo"-template op download-pagina's
    title: { absolute: `${title} | Wouter.Download` },
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
  const metadata = await getCachedMetadata(slug);

  if (!metadata) {
    notFound();
  }

  if (isExpired(metadata)) {
    const expiresAt = computeExpiresAtDate(metadata);
    const destination = 'https://www.wouter.photo';
    return (
      <ExpiredRedirect
        destination={destination}
        title="This download has expired"
        description={
          expiresAt
            ? `This link expired on ${expiresAt.toLocaleDateString('en-US')}. Need the files again? Request a new link below.`
            : 'This link has expired. Need the files again? Request a new link below.'
        }
        slug={slug}
      />
    );
  }


  const expiresAt = computeExpiresAtIso(metadata) ?? undefined;

  // Alleen de velden die de klant-pagina nodig heeft. Nooit het volledige
  // metadata-object doorgeven: downloadHistory bevat IP-adressen en
  // user-agents van eerdere downloaders en zou anders in de paginabron
  // van elke bezoeker belanden.
  const clientMetadata = {
    slug: metadata.slug,
    title: metadata.title,
    createdAt: metadata.createdAt,
    expiresAt: metadata.expiresAt,
    files: metadata.files,
    previewImageKey: metadata.previewImageKey,
    backgroundImageKey: metadata.backgroundImageKey,
    ratings: metadata.ratings,
    ratingsEnabled: metadata.ratingsEnabled,
    useDefaultHero: metadata.useDefaultHero,
    downloads: 0,
  };

  return <DownloadGallery metadata={clientMetadata} expiresAt={expiresAt} />;
}
