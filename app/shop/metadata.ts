import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop – Wouter.Photo | Photography Prints & Products',
  description: 'Shop high-quality photography prints by Wouter Vellekoop. Professional concert and event photography available as premium wall art and collectible prints.',
  keywords: [
    'photography prints',
    'wall art',
    'concert photography prints',
    'event photography prints',
    'professional photography',
    'fine art prints',
    'music photography art',
    'photographer shop',
    'photo prints for sale',
    'Wouter Vellekoop prints',
    'Netherlands photographer',
    'photography merchandise',
    'collectible prints',
    'home decor photography'
  ],
  openGraph: {
    title: 'Shop Photography Prints – Wouter.Photo',
    description: 'Shop high-quality photography prints by Wouter Vellekoop. Professional concert and event photography available as premium wall art and collectible prints.',
    url: 'https://wouter.photo/shop',
    siteName: 'Wouter.Photo',
    images: [
      {
        url: 'https://wouter.photo/shop/print1.jpg',
        width: 1200,
        height: 800,
        alt: 'Photography Prints by Wouter Vellekoop',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Photography Prints – Wouter.Photo',
    description: 'Shop high-quality photography prints by Wouter Vellekoop. Professional concert and event photography available as premium wall art and collectible prints.',
    images: ['https://wouter.photo/shop/print1.jpg'],
  },
  alternates: {
    canonical: 'https://wouter.photo/shop',
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
