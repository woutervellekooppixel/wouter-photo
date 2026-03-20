import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund policy – wouter.photo',
  description: 'Refund policy for wouter.photo digital products (downloads).',
  keywords: [
    'refund policy',
    'wouter.photo',
    'digitale producten',
    'digital products',
    'downloads',
  ],
  openGraph: {
    title: 'Refund policy – wouter.photo',
    description: 'Refund policy for wouter.photo digital products (downloads).',
    url: 'https://wouter.photo/refund-policy',
    siteName: 'Wouter.Photo',
    locale: 'en_US',
    alternateLocale: ['nl_NL'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Refund policy – wouter.photo',
    description: 'Refund policy for wouter.photo digital products (downloads).',
  },
  alternates: {
    canonical: 'https://wouter.photo/refund-policy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
