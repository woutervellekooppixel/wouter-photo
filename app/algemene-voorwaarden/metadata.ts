import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Algemene voorwaarden – wouter.photo',
  description: 'Algemene voorwaarden van wouter.photo voor fotografie-opdrachten, levering, auteursrecht, licentie en aansprakelijkheid.',
  keywords: [
    'algemene voorwaarden',
    'fotografie voorwaarden',
    'wouter.photo',
    'auteursrecht fotografie',
    'licentie fotografie',
    'fotograaf voorwaarden',
  ],
  openGraph: {
    title: 'Algemene voorwaarden – wouter.photo',
    description: 'Algemene voorwaarden van wouter.photo voor fotografie-opdrachten.',
    url: 'https://wouter.photo/algemene-voorwaarden',
    siteName: 'Wouter.Photo',
    locale: 'nl_NL',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Algemene voorwaarden – wouter.photo',
    description: 'Algemene voorwaarden van wouter.photo voor fotografie-opdrachten.',
  },
  alternates: {
    canonical: 'https://wouter.photo/algemene-voorwaarden',
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
