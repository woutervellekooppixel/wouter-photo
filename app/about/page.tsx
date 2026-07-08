import Image from 'next/image'
import Link from 'next/link'
import PhoneReveal from '@/components/PhoneReveal'
import FloatingContactButton from '@/components/FloatingContactButton'
import { metadata as pageMetadata } from './metadata'

export const metadata = pageMetadata

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Wouter Vellekoop',
            jobTitle: 'Photographer',
            url: 'https://www.wouter.photo',
            sameAs: [
              'https://instagram.com/woutervellekoop',
              'https://linkedin.com/in/woutervellekoop',
            ],
          }),
        }}
      />

      <main className="min-h-dvh bg-white dark:bg-black text-black dark:text-white">

        {/* ── Bio ─────────────────────────────────────────────────────── */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

            {/* Photo */}
            <div className="relative w-full aspect-[2/3] max-h-[600px] md:max-h-none sticky top-24">
              <Image
                src="/2022_NSJF-Fri_1179.jpg"
                alt="Wouter Vellekoop — concert photographer"
                fill
                priority
                className="shadow-lg object-cover rounded-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Text */}
            <div className="space-y-8 text-base leading-relaxed">
              <div>
                <h1 className="text-3xl font-bold mb-6 tracking-tight">About</h1>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    I&apos;m Wouter Vellekoop – a photographer based in the Netherlands, specializing in concert, event, conceptual, and advertising photography.
                    My passion lies in capturing the raw energy of live performances and translating atmosphere into powerful visuals.
                  </p>
                  <p>
                    I&apos;ve worked with a wide range of artists, venues, organisations and media outlets, combining speed, consistency and style.
                    Whether it&apos;s the chaos of a music festival or the intimacy of a backstage moment, I aim to tell stories that resonate.
                  </p>
                  <p>
                    Based in the Netherlands and available for bookings worldwide, I photograph concerts and festivals — from clubs to venues
                    like Ziggo Dome, Carré and Ahoy — alongside corporate and public events, conceptual series, and commercial campaigns
                    for brands, agencies and media.
                  </p>
                </div>
              </div>

              {/* Clients */}
              <div>
                <h2 className="text-lg font-semibold mb-2 tracking-tight">Clients</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  MOJO, Radio 538, North Sea Jazz, Ahoy', Talpa, BNN VARA, Residentie Orkest,
                  UNICEF Nederland, and many more.
                </p>
              </div>

              {/* Contact */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <a
                    href="mailto:hello@wouter.photo"
                    className="underline underline-offset-4 hover:text-black dark:hover:text-white transition-colors"
                  >
                    hello@wouter.photo
                  </a>
                  <PhoneReveal />
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-semibold hover:border-gray-500 dark:hover:border-gray-500 transition-colors"
                >
                  View portfolio
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
