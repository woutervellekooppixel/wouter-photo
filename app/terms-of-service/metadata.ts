import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of service (Shop) – wouter.photo',
  description:
    'Terms of service for the wouter.photo shop (digital products like presets and plugins).',
  keywords: [
    'terms of service',
    'terms and conditions',
    'digital products',
    'Lightroom presets',
    'Adobe Camera Raw',
    'plugins',
    'wouter.photo',
  ],
  openGraph: {
    title: 'Terms of service (Shop) – wouter.photo',
    description:
      'Terms of service for the wouter.photo shop (digital products like presets and plugins).',
    url: 'https://wouter.photo/terms-of-service',
    siteName: 'Wouter.Photo',
    locale: 'en_US',
    alternateLocale: ['nl_NL'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of service (Shop) – wouter.photo',
    description:
      'Terms of service for the wouter.photo shop (digital products like presets and plugins).',
  },
  alternates: {
    canonical: 'https://wouter.photo/terms-of-service',
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
