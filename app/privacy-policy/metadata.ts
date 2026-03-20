import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy policy – wouter.photo',
  description: 'Privacy policy van wouter.photo: welke persoonsgegevens we verwerken, waarom, en welke rechten je hebt.',
  keywords: [
    'privacy policy',
    'privacyverklaring',
    'wouter.photo',
    'persoonsgegevens',
    'AVG',
    'GDPR',
  ],
  openGraph: {
    title: 'Privacy policy – wouter.photo',
    description: 'Privacy policy van wouter.photo (AVG/GDPR).',
    url: 'https://wouter.photo/privacy-policy',
    siteName: 'Wouter.Photo',
    locale: 'nl_NL',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy policy – wouter.photo',
    description: 'Privacy policy van wouter.photo (AVG/GDPR).',
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
