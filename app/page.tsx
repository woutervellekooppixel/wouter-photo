import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPortfolioGalleryData } from '@/lib/portfolioGallery'
import DisableBodyScroll from '@/components/DisableBodyScroll'
import HeroWordmark from '@/components/HeroWordmark'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Wouter.Photo',
  description: 'Portfolio — Concerts, Events en Misc.',
  alternates: {
    canonical: 'https://wouter.photo',
  },
}

export default async function HomePage() {
  const gallery = await getPortfolioGalleryData()

  const hero = gallery.concerts?.[0]
  const heroSrc = hero?.src ?? '/api/background/default-background'
  const heroAlt = hero?.alt ?? 'Concert photography by Wouter Vellekoop'

  return (
    <main className="min-h-dvh overflow-hidden bg-white dark:bg-black">
      <DisableBodyScroll />
      {/* Use fixed so the hero sits behind the transparent header */}
      <section className="fixed inset-0">
        <Image
          src={heroSrc}
          alt={heroAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Overlays for readability */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

        {/* Centered logo + buttons */}
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div className="w-full max-w-xl text-center">
            <div className="animate-in fade-in zoom-in-95 duration-700">
              <div className="inline-flex flex-col items-center gap-2">
                <HeroWordmark
                  className="text-white tracking-tight leading-none text-5xl sm:text-6xl md:text-7xl"
                  wordClassName="font-extrabold"
                  suffixClassName="font-light opacity-90"
                  intervalMs={380}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center sm:flex-row sm:items-center gap-3 justify-center">
              <Link
                href="/portfolio"
                className="animate-in fade-in slide-in-from-bottom-3 duration-700 inline-flex items-center justify-center rounded-md border border-white/30 bg-white/10 px-6 py-3 text-white font-semibold uppercase tracking-widest backdrop-blur-md transition-colors hover:bg-white/20"
                style={{ animationDelay: '220ms' }}
              >
                Portfolio
              </Link>

              <Link
                href="/about"
                className="animate-in fade-in slide-in-from-bottom-3 duration-700 inline-flex items-center justify-center rounded-md border border-white/30 bg-white/10 px-6 py-3 text-white font-semibold uppercase tracking-widest backdrop-blur-md transition-colors hover:bg-white/20"
                style={{ animationDelay: '310ms' }}
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}