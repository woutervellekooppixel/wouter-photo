import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio – Wouter.Photo | Professional Photography Gallery',
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
    url: 'https://wouter.photo/portfolio',
    siteName: 'Wouter.Photo',
    images: [
      {
        url: 'https://wouter.photo/photos/concerts/portfolio-concerts1.webp',
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
    images: ['https://wouter.photo/photos/concerts/portfolio-concerts1.webp'],
  },
  alternates: {
    canonical: 'https://wouter.photo/portfolio',
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
