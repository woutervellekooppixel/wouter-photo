import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Photography Blog | Professional Tips & Gear Reviews | Wouter Vellekoop',
  description: 'Expert photography blog covering concert photography techniques, camera gear reviews, and professional tips. Learn from award-winning photographer Wouter Vellekoop.',
  keywords: [
    'photography blog',
    'concert photography tips',
    'camera gear reviews',
    'professional photography',
    'photography techniques',
    'Canon photography',
    'concert photography gear',
    'event photography tips',
    'photography equipment reviews',
    'music photography blog'
  ],
  openGraph: {
    title: 'Photography Blog | Professional Tips & Gear Reviews',
    description: 'Expert photography blog covering concert photography techniques, camera gear reviews, and professional tips.',
    url: 'https://wouter.photo/blog',
    siteName: 'Wouter Vellekoop Photography',
    images: [
      {
        url: 'https://wouter.photo/photos/concerts/portfolio-concerts1.webp',
        width: 1200,
        height: 630,
        alt: 'Photography Blog - Professional Tips and Gear Reviews',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photography Blog | Professional Tips & Gear Reviews',
    description: 'Expert photography blog covering concert photography techniques and gear reviews.',
    images: ['https://wouter.photo/photos/concerts/portfolio-concerts1.webp'],
  },
  alternates: {
    canonical: 'https://wouter.photo/blog',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
