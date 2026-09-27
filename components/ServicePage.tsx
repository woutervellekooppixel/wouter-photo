import Image from 'next/image'
import Link from 'next/link'
import FloatingContactButton from '@/components/FloatingContactButton'
import type { Photo } from '@/lib/portfolioGallery'

const BASE = 'https://www.wouter.photo'

export type ServiceLink = { href: string; label: string }

// Nederlandstalige dienstpagina (concert-/event-/portretfotograaf). Zelfde opbouw
// als /about: foto links, tekst rechts. Geen FAQ — bewuste keuze van Wouter.
export default function ServicePage({
  path,
  title,
  serviceType,
  description,
  photo,
  paragraphs,
  highlights,
  portfolio,
  related,
}: {
  path: string
  title: string
  serviceType: string
  description: string
  photo?: Photo
  paragraphs: React.ReactNode[]
  highlights: { heading: string; text: string }
  portfolio: ServiceLink
  related: ServiceLink[]
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${BASE}${path}#service`,
    name: title,
    serviceType,
    description,
    url: `${BASE}${path}`,
    inLanguage: 'nl-NL',
    provider: { '@id': `${BASE}/#business` },
    areaServed: { '@type': 'Country', name: 'Nederland' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main lang="nl" className="min-h-dvh bg-white dark:bg-black text-black dark:text-white">
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {photo && (
              <div className="relative w-full aspect-[2/3] max-h-[600px] md:max-h-none md:sticky md:top-24">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  priority
                  className="shadow-lg object-cover rounded-2xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}

            <div className="space-y-8 text-base leading-relaxed">
              <div>
                <h1 className="text-3xl font-bold mb-6 tracking-tight">{title}</h1>
                <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2 tracking-tight">{highlights.heading}</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {highlights.text}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Ook:{' '}
                  {related.map((r, i) => (
                    <span key={r.href}>
                      {i > 0 && ' · '}
                      <Link
                        href={r.href}
                        className="underline underline-offset-4 hover:text-black dark:hover:text-white transition-colors"
                      >
                        {r.label}
                      </Link>
                    </span>
                  ))}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={portfolio.href}
                  className="press-feedback inline-flex items-center gap-2 rounded-full border border-neutral-300 dark:border-neutral-700 px-5 py-2.5 text-sm font-semibold hover:border-neutral-500 transition-colors"
                >
                  {portfolio.label}
                </Link>
                <FloatingContactButton />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

// Eerste foto met een specifieke alt-tekst ("Artiest Zaal, 2026 — …"); anders de eerste.
export function pickServicePhoto(photos: Photo[] | undefined): Photo | undefined {
  return photos?.find((p) => p.alt.includes(', 20')) ?? photos?.[0]
}

export function serviceMetadata(path: string, title: string, description: string) {
  const url = `${BASE}${path}`
  return {
    title: { absolute: `${title} Wouter Vellekoop – heel Nederland` },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} Wouter Vellekoop`,
      description,
      url,
      siteName: 'Wouter.Photo',
      locale: 'nl_NL',
      type: 'website' as const,
      images: [{ url: `${BASE}/2022_NSJF-Fri_1179.jpg`, width: 1200, height: 800, alt: `${title} Wouter Vellekoop` }],
    },
  }
}
