import type { Metadata } from 'next'
import ServicePage, { pickServicePhoto, serviceMetadata } from '@/components/ServicePage'
import { getCachedPortfolioGalleryData } from '@/lib/portfolioCache'

export const revalidate = 3600

const PATH = '/concert-photographer'
const DESCRIPTION =
  'Wouter Vellekoop is a concert photographer for artists, venues, festivals and media across the Netherlands and beyond — from club shows to Ziggo Dome, Carré, Ahoy and North Sea Jazz.'

export const metadata: Metadata = serviceMetadata('en', { nl: '/concertfotograaf', en: PATH }, 'Concert Photographer', DESCRIPTION)

export default async function ConcertPhotographerPage() {
  const gallery = await getCachedPortfolioGalleryData()

  return (
    <ServicePage
      locale="en"
      translation={{ href: '/concertfotograaf', label: 'In het Nederlands' }}
      path={PATH}
      title="Concert Photographer"
      serviceType="Concert photography"
      description={DESCRIPTION}
      photo={pickServicePhoto(gallery.concerts)}
      paragraphs={[
        <>
          I&apos;m Wouter Vellekoop, a concert photographer for artists, managements, venues, festivals and media —
          based in the Netherlands, working nationwide and available internationally. From small club shows to Ziggo
          Dome, Carré and Ahoy, and festivals such as North Sea Jazz and Rewire.
        </>,
        <>
          In the pit I work fast and unobtrusively. I know the dynamics of a show, understand what LED walls and
          changing stage light do to an image, and make sure the energy of the night ends up in the photos — not just
          who was on stage.
        </>,
        <>
          I deliver fast and consistently through my own download portal, so management, marketing and press can use
          the images straight away for press releases, socials and campaigns.
        </>,
      ]}
      highlights={{
        heading: 'Clients',
        text: 'North Sea Jazz, Ahoy, MOJO, Radio 538, Residentie Orkest and many more.',
      }}
      portfolio={{ href: '/portfolio/concerts', label: 'View concert portfolio' }}
      related={[
        { href: '/event-photographer', label: 'Event photographer' },
        { href: '/portrait-photographer', label: 'Portrait & set photographer' },
      ]}
    />
  )
}
