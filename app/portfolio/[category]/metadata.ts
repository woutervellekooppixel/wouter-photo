import type { Metadata } from 'next'

const validCategories = ['concerts', 'events', 'misc'] as const
type Category = (typeof validCategories)[number]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params

  if (!validCategories.includes(category as Category)) {
    return {
      title: 'Wouter.Photo – Portfolio',
      description: 'Photography by Wouter Vellekoop',
    }
  }

  const categoryData: Record<Category, {
    title: string
    description: string
    keywords: string[]
  }> = {
    concerts: {
      title: 'Concert Photography',
      description: 'Professional concert photography by Wouter Vellekoop. Capturing the energy and atmosphere of live music performances with dynamic lighting and powerful compositions.',
      keywords: [
        // NL
        'concertfotografie',
        'concertfotograaf',
        'muziekfotografie',
        'live muziek fotografie',
        // EN
        'concert photography',
        'music photography',
        'live music',
        'stage photography',
        'concert photographer Netherlands',
        'music venue photography',
        'band photography',
        'live performance photography',
      ]
    },
    events: {
      title: 'Event Photography',
      description: 'Professional event photography services by Wouter Vellekoop. Documenting corporate events, festivals, and special occasions with attention to detail and storytelling.',
      keywords: [
        // NL
        'eventfotografie',
        'eventfotograaf',
        'bedrijfsfotografie',
        'conferentie fotografie',
        'festivalfotografie',
        // EN
        'event photography',
        'corporate photography',
        'festival photography',
        'professional event photographer',
        'event photographer Netherlands',
        'corporate events',
        'conference photography',
        'celebration photography',
      ]
    },
    misc: {
      title: 'Miscellaneous Photography',
      description: 'Diverse photography work by Wouter Vellekoop. Exploring various subjects and styles including portraits, landscapes, and creative projects.',
      keywords: [
        // NL
        'fotograaf Nederland',
        'portretfotografie',
        'creatieve fotografie',
        'commerciële fotografie',
        // EN
        'photographer Netherlands',
        'creative photography',
        'portrait photography',
        'landscape photography',
        'professional photographer',
        'photography services',
        'artistic photography',
        'commercial photography',
      ]
    }
  }

  const data = categoryData[category as Category]
  const baseUrl = 'https://wouter.photo'

  return {
    title: `${data.title} – Wouter.Photo`,
    description: data.description,
    keywords: data.keywords,
    openGraph: {
      title: `${data.title} – Professional Photography by Wouter Vellekoop`,
      description: data.description,
      url: `${baseUrl}/portfolio/${category}`,
      siteName: 'Wouter.Photo',
      images: [
        {
          url: `${baseUrl}/photos/${category}/portfolio-${category}1.webp`,
          width: 1200,
          height: 800,
          alt: `${data.title} by Wouter Vellekoop`,
        }
      ],
      locale: 'nl_NL',
      alternateLocale: ['en_US'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.title} – Wouter.Photo`,
      description: data.description,
      images: [`${baseUrl}/photos/${category}/portfolio-${category}1.webp`],
    },
    alternates: {
      canonical: `${baseUrl}/portfolio/${category}`,
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
}
