import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About – Wouter Vellekoop | Professional Photographer',
  description: 'Meet Wouter Vellekoop, professional photographer specializing in concert and event photography. Based in the Netherlands, available for bookings worldwide.',
  keywords: [
    'Wouter Vellekoop',
    'professional photographer',
    'photographer Netherlands',
    'concert photographer',
    'event photographer',
    'music photographer',
    'photography services',
    'professional photography',
    'about photographer',
    'photography biography',
    'Netherlands photographer',
    'live music photography',
    'event photography services'
  ],
  openGraph: {
    title: 'About Wouter Vellekoop – Professional Photographer',
    description: 'Meet Wouter Vellekoop, professional photographer specializing in concert and event photography. Based in the Netherlands, available for bookings worldwide.',
    url: 'https://wouter.photo/about',
    siteName: 'Wouter.Photo',
    images: [
      {
        url: 'https://wouter.photo/2022_NSJF-Fri_1179.jpg',
        width: 1200,
        height: 800,
        alt: 'Wouter Vellekoop - Professional Photographer',
      }
    ],
    locale: 'en_US',
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Wouter Vellekoop – Professional Photographer',
    description: 'Meet Wouter Vellekoop, professional photographer specializing in concert and event photography. Based in the Netherlands, available for bookings worldwide.',
    images: ['https://wouter.photo/2022_NSJF-Fri_1179.jpg'],
  },
  alternates: {
    canonical: 'https://wouter.photo/about',
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
