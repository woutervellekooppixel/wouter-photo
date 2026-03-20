import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy policy – wouter.photo',
  description: 'Privacy policy for wouter.photo: what personal data we process, why we do it, and your rights.',
  keywords: [
    'privacy policy',
    'wouter.photo',
    'GDPR',
    'personal data',
  ],
  openGraph: {
    title: 'Privacy policy – wouter.photo',
    description: 'Privacy policy for wouter.photo (GDPR).',
    url: 'https://wouter.photo/privacy-policy',
    siteName: 'Wouter.Photo',
    locale: 'en_US',
    alternateLocale: ['nl_NL'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy policy – wouter.photo',
    description: 'Privacy policy for wouter.photo (GDPR).',
  },
  alternates: {
    canonical: 'https://wouter.photo/privacy-policy',
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
