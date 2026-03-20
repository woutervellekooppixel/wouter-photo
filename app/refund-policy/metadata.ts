import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund policy – wouter.photo',
  description: 'Refund policy van wouter.photo voor digitale producten (downloads).',
  keywords: [
    'refund policy',
    'restitutiebeleid',
    'terugbetaling',
    'wouter.photo',
    'digitale producten',
  ],
  openGraph: {
    title: 'Refund policy – wouter.photo',
    description: 'Refund policy van wouter.photo voor digitale producten (downloads).',
    url: 'https://wouter.photo/refund-policy',
    siteName: 'Wouter.Photo',
    locale: 'nl_NL',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Refund policy – wouter.photo',
    description: 'Refund policy van wouter.photo voor digitale producten (downloads).',
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
