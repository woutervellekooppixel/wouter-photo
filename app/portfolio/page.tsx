import { getGalleryData } from './gallery-data'
import Image from 'next/image'
import Link from 'next/link'
import DisableBodyScroll from '@/components/DisableBodyScroll'
import SetHeaderHeightVar from '@/components/SetHeaderHeightVar'


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

      <section
        className="relative w-full"
        style={{ height: 'calc(100dvh - var(--header-h, 0px))' }}
      >
        <div className="grid h-full w-full grid-cols-1 grid-rows-3 md:grid-cols-3 md:grid-rows-1">
          {categories.map((cat, idx) => {
            const first = data[cat.key]?.[0]
            const src = first?.src ?? '/api/background/default-background'
            const alt = first?.alt ?? cat.label

            return (
              <Link
                key={cat.key}
                href={cat.href}
                className="group relative overflow-hidden bg-gray-100 dark:bg-white/5"
                aria-label={`Open ${cat.label} portfolio`}
              >
                <div className="relative h-full">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />

                  {/* Readability overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/20" />

                  {/* Big label bottom-left (smaller + animated on hover) */}
                  <div className="absolute left-6 bottom-6 md:left-8 md:bottom-8">
                    <div
                      className="text-white text-[clamp(2.2rem,3.4vw,4.6rem)] font-extrabold tracking-tight leading-[0.9] drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)] will-change-transform transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:tracking-wide"
                    >
                      {cat.bigLabel}
                    </div>
                  </div>

                  {/* Hover affordance */}
                  <div className="absolute right-6 bottom-6 md:right-8 md:bottom-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="rounded-full bg-white/15 px-3 py-1.5 text-white text-xs font-semibold tracking-widest backdrop-blur-sm ring-1 ring-white/20">
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
