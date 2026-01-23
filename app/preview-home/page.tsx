import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preview Home (Draft) – Wouter.Photo',
  description:
    'Draft homepage preview. Concert- en eventfotograaf in Nederland (NL/EN), wereldwijd beschikbaar.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-image-preview': 'none',
      'max-snippet': 0,
      'max-video-preview': 0,
    },
  },
  alternates: {
    canonical: 'https://wouter.photo/preview-home',
  },
}

export default function PreviewHomePage() {
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Wouter Vellekoop',
    jobTitle: 'Concert & Event Photographer',
    url: 'https://wouter.photo',
    image: 'https://wouter.photo/2022_NSJF-Fri_1179.jpg',
    sameAs: ['https://instagram.com/woutervellekoop', 'https://linkedin.com/in/woutervellekoop'],
  }

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Wouter.Photo',
    url: 'https://wouter.photo',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'Business Inquiries',
        email: 'hello@wouter.photo',
        telephone: '+31616290418',
      },
    ],
    sameAs: ['https://instagram.com/woutervellekoop', 'https://linkedin.com/in/woutervellekoop'],
  }

  return (
    <main className="min-h-dvh bg-white dark:bg-black text-black dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/2022_NSJF-Fri_1179.jpg"
            alt="Wouter Vellekoop"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/70" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
              Draft preview • Not indexed
            </div>

            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight text-white">
              Wouter Vellekoop
              <span className="block font-light opacity-95">Concert & Event Photographer</span>
            </h1>
            <p className="mt-5 text-base md:text-lg leading-relaxed text-white/90">
              Concert- en eventfotografie (NL/EN). Gebaseerd in Nederland, wereldwijd beschikbaar. Snelle delivery,
              consistente nabewerking, en beeld dat werkt voor PR, socials en campagnes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/31616290418?text=Hi%20Wouter%2C%20ik%20heb%20een%20vraag%20over%20een%20shoot%20(%5Bdatum%5D%2C%20%5Bplaats%5D)."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-white text-black px-6 py-3 text-sm font-semibold"
              >
                WhatsApp
              </a>
              <a
                href="tel:+31616290418"
                className="inline-flex items-center justify-center rounded-md border border-white/30 bg-transparent text-white px-6 py-3 text-sm font-semibold"
              >
                Bel
              </a>
              <a
                href="mailto:hello@wouter.photo"
                className="inline-flex items-center justify-center rounded-md border border-white/30 bg-transparent text-white px-6 py-3 text-sm font-semibold"
              >
                E-mail
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
              <span>Heel Nederland</span>
              <span aria-hidden>•</span>
              <span>Worldwide available</span>
              <span aria-hidden>•</span>
              <span>PR / marketing / editorial</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Concert Photography',
              desc: 'Clubs, venues, tours, festivals. Fast delivery, consistent edits.',
              href: '/portfolio/concerts',
            },
            {
              title: 'Event Photography',
              desc: 'Corporate events, premieres, brand activations, backstage coverage.',
              href: '/portfolio/events',
            },
            {
              title: 'Commercial / Advertising',
              desc: 'Conceptual and campaign work with a clean, bold visual style.',
              href: '/about',
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-6"
            >
              <h2 className="text-lg font-bold">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{c.desc}</p>
              <div className="mt-4">
                <Link className="text-sm font-semibold underline" href={c.href}>
                  View work
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="mx-auto max-w-6xl px-6 pb-14 md:pb-16">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 p-8">
          <h2 className="text-xl font-bold">Clients</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            MOJO, Radio 538, North Sea Jazz, Ahoy, Talpa, BNN VARA, Residentie Orkest, UNICEF Nederland, …
          </p>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Tip: voeg hier later 6–12 logo’s toe voor maximale trust.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-6xl px-6 pb-14 md:pb-16">
        <h2 className="text-xl font-bold">Werkwijze</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: '1. Briefing', desc: 'Datum, venue, deliverables, usage/licensing.' },
            { title: '2. Shoot', desc: 'Efficiënt, on-brand, met oog voor storytelling.' },
            { title: '3. Select & Edit', desc: 'Consistente look, afgestemd op PR/socials.' },
            { title: '4. Delivery', desc: 'Snelle oplevering + duidelijke usage afspraken.' },
          ].map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-5"
            >
              <div className="text-sm font-bold">{s.title}</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-xl font-bold">FAQ</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              q: 'Hoe snel lever je?',
              a: 'In overleg: same day / next day voor PR, of een complete set binnen enkele dagen.',
            },
            {
              q: 'Werk je internationaal?',
              a: 'Ja. Ik ben gebaseerd in Nederland en beschikbaar wereldwijd.',
            },
            {
              q: 'Do you work in English?',
              a: 'Yes — communication and deliverables can be fully in English.',
            },
            {
              q: 'Licensing / usage?',
              a: 'We stemmen usage vooraf af (PR, social, commercial) zodat je precies krijgt wat je nodig hebt.',
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-6"
            >
              <div className="text-sm font-bold">{item.q}</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.a}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/31616290418?text=Hi%20Wouter%2C%20ik%20wil%20graag%20meer%20info%20over%20beschikbaarheid%20en%20tarieven."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black px-6 py-3 text-sm font-semibold"
          >
            WhatsApp for availability
          </a>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 px-6 py-3 text-sm font-semibold"
          >
            About
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 px-6 py-3 text-sm font-semibold"
          >
            Portfolio
          </Link>
        </div>
      </section>
    </main>
  )
}
