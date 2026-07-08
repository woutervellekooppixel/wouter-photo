import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio – Professional Photography Gallery',
  description: 'Bekijk het portfolio van Wouter Vellekoop: concertfotografie, eventfotografie en creatief werk (NL/EN).',
  keywords: [
    // NL
    'portfolio fotograaf',
    'concertfotografie',
    'eventfotografie',
    'muziekfotografie',
    'fotograaf Nederland',
    'photography portfolio',
    'professional photographer',
    'concert photography',
    'event photography',
    'music photography',
    'Wouter Vellekoop portfolio',
    'Netherlands photographer',
    'photography gallery',
    'professional photography services',
    'live music photography',
    'event photographer portfolio',
    'creative photography',
    'commercial photography',
    'photography showcase'
  ],
  openGraph: {
    title: 'Photography Portfolio – Wouter Vellekoop',
    description: 'Portfolio met concertfotografie, eventfotografie en meer (NL/EN).',
    url: 'https://www.wouter.photo/portfolio',
    siteName: 'Wouter.Photo',
    images: [
      {
        url: 'https://www.wouter.photo/2022_NSJF-Fri_1179.jpg',
        width: 1200,
        height: 800,
        alt: 'Photography Portfolio by Wouter Vellekoop',
      }
    ],
    locale: 'nl_NL',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photography Portfolio – Wouter Vellekoop',
    description: 'Browse the professional photography portfolio of Wouter Vellekoop. Featuring concert photography, event photography, and creative work from the Netherlands and beyond.',
    images: ['https://www.wouter.photo/2022_NSJF-Fri_1179.jpg'],
  },
  alternates: {
    canonical: 'https://www.wouter.photo/portfolio',
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
