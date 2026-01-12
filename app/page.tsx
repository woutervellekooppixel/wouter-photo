import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Concertfotograaf & Event Photographer | Wouter Vellekoop',
  description:
    'Concert- en eventfotograaf in Nederland (NL/EN). Concert photography, event photography en advertising shoots. Boekingen voor managers, marketing, productie en agencies.',
  keywords: [
    // NL
    'concertfotograaf',
    'eventfotograaf',
    'muziekfotografie',
    'festivalfotograaf',
    'bedrijfsfotografie',
    'persfotograaf concert',
    'fotograaf inhuren',
    // EN
    'concert photographer Netherlands',
    'event photographer',
    'live music photography',
    'festival photographer',
    'corporate event photography',
    'music photographer',
    'photographer for brands',
  ],
  openGraph: {
    title: 'Concertfotograaf & Event Photographer | Wouter Vellekoop',
    description:
      'NL/EN concert- en eventfotograaf. Voor managers, marketing, productie en agencies. Professionele concert photography & event photography in Nederland.',
    url: 'https://wouter.photo',
    siteName: 'Wouter.Photo',
    images: [
      {
        url: 'https://wouter.photo/2022_NSJF-Fri_1179.jpg',
        width: 1200,
        height: 630,
        alt: 'Wouter Vellekoop - Concert & Event Photographer',
      },
    ],
    locale: 'nl_NL',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wouter Vellekoop | Concert & Event Photographer',
    description: 'NL/EN concert- en eventfotograaf in Nederland.',
    images: ['https://wouter.photo/2022_NSJF-Fri_1179.jpg'],
  },
  alternates: {
    canonical: 'https://wouter.photo',
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Concertfotografie &amp; Event Photography
        </h1>
        <p className="mt-5 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Ik ben Wouter Vellekoop — concert- en eventfotograaf in Nederland. I work in Dutch and English and
          deliver fast, consistent imagery for managers, marketing teams, production and agencies.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center rounded-md bg-gray-900 text-white px-5 py-3 text-sm font-semibold hover:bg-gray-800"
          >
            Bekijk portfolio
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-5 py-3 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5"
          >
            Over / About
          </Link>
          <a
            href="mailto:hello@wouter.photo"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-5 py-3 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5"
          >
            Boekingen / Bookings
          </a>
        </div>
      </section>
    </main>
  )
}