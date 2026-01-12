import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPortfolioGalleryData } from '@/lib/portfolioGallery'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Wouter.Photo',
  description: 'Portfolio — Concerts, Events en Misc.',
  alternates: {
    canonical: 'https://wouter.photo',
  },
}

const HOME_CATEGORIES = [
  { key: 'concerts', label: 'Concerts', href: '/portfolio/concerts' },
  { key: 'events', label: 'Events', href: '/portfolio/events' },
  { key: 'misc', label: 'Misc', href: '/portfolio/misc' },
] as const

export default async function HomePage() {
  const gallery = await getPortfolioGalleryData()

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {HOME_CATEGORIES.map((cat, idx) => {
            const first = gallery[cat.key]?.[0]
            const src = first?.src ?? '/api/background/default-background'

            return (
              <Link
                key={cat.key}
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-gray-100 dark:bg-white/5"
                aria-label={`Open ${cat.label} portfolio`}
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={src}
                    alt={first?.alt ?? cat.label}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="px-4 py-2 rounded-full bg-black/45 backdrop-blur-sm">
                      <span className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {cat.label}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}