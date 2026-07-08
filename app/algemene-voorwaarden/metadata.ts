import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
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
    url: 'https://www.wouter.photo/algemene-voorwaarden',
    siteName: 'Wouter.Photo',
    images: [
      {
        url: 'https://www.wouter.photo/2022_NSJF-Fri_1179.jpg',
        width: 1200,
        height: 800,
        alt: 'Wouter Vellekoop – wouter.photo',
      },
    ],
    locale: 'nl_NL',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Algemene voorwaarden – wouter.photo',
    description: 'Algemene voorwaarden van wouter.photo voor fotografie-opdrachten.',
    images: ['https://www.wouter.photo/2022_NSJF-Fri_1179.jpg'],
  },
  alternates: {
    canonical: 'https://www.wouter.photo/algemene-voorwaarden',
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
