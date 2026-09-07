import { getGalleryData } from './gallery-data'
import Image from 'next/image'
import Link from 'next/link'
import DisableBodyScroll from '@/components/DisableBodyScroll'
import SetHeaderHeightVar from '@/components/SetHeaderHeightVar'
import { metadata as pageMetadata } from './metadata'

export const metadata = pageMetadata

// ISR: cache + hourly refresh instead of force-dynamic (fewer R2 round-trips).
export const revalidate = 3600

export default async function PortfolioPage() {
  const data = await getGalleryData()

  const categories = [
    {
      key: 'concerts',
      label: 'Concerts',
      bigLabel: 'CONCERTS',
      href: '/portfolio/concerts',
      titleStyle: 'vertical-right',
    },
    {
      key: 'events',
      label: 'Events',
      bigLabel: 'EVENTS',
      href: '/portfolio/events',
      titleStyle: 'horizontal',
    },
    {
      key: 'misc',
      label: 'Misc',
      bigLabel: 'MISC',
      href: '/portfolio/misc',
      titleStyle: 'vertical-left',
    },
  ] as const

  return (
    <main className="bg-white dark:bg-black overflow-hidden">
      <DisableBodyScroll />
      <SetHeaderHeightVar />
      <h1 className="sr-only">Photography Portfolio — Wouter Vellekoop</h1>

      <section
        className="relative w-full"
        style={{ height: 'calc(100dvh - var(--header-h, 0px))' }}
      >
        <div className="grid h-full w-full grid-cols-1 grid-rows-3 md:grid-cols-3 md:grid-rows-1">
          {categories.map((cat, idx) => {
            const first = data[cat.key]?.[0]
            const src = first?.src ?? null
            const alt = first?.alt ?? cat.label

            return (
              <Link
                key={cat.key}
                href={cat.href}
                className="portfolio-tile group relative overflow-hidden bg-gray-100 dark:bg-white/5"
                aria-label={`Open ${cat.label} portfolio`}
              >
                <div className="relative h-full">
                  {src && (
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-200 ease-out motion-safe:group-hover:scale-[1.02] motion-reduce:transition-none"
                  />
                  )}

                  {/* Readability overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/20" />

                  <span className="portfolio-focus-frame" aria-hidden="true">
                    <span /><span /><span /><span />
                  </span>

                  {/* Big label bottom-left (smaller + animated on hover) */}
                  <div className="absolute left-6 bottom-6 md:left-8 md:bottom-8">
                    <div
                      className="text-white text-[clamp(1.25rem,1.9vw,2.5rem)] font-light tracking-[-0.02em] leading-[0.9] drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)] transition-transform duration-200 ease-out motion-safe:group-hover:-translate-y-0.5 motion-reduce:transition-none"
                    >
                      {cat.bigLabel}
                    </div>
                  </div>

                  {/* Hover affordance */}
                  <div className="absolute right-6 bottom-6 md:right-8 md:bottom-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                    <div className="text-white text-xs font-light tracking-[0.35em] drop-shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
                      OPEN ↗
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
