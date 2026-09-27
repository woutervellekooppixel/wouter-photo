import type { Metadata } from 'next'
import ServicePage, { pickServicePhoto, serviceMetadata } from '@/components/ServicePage'
import { getCachedPortfolioGalleryData } from '@/lib/portfolioCache'

export const revalidate = 3600

const PATH = '/event-photographer'
const DESCRIPTION =
  'Wouter Vellekoop is an event photographer for production companies, brands and organisations across the Netherlands and beyond — from TwitchCon at Ahoy to Luminiscence in the Nieuwe Kerk.'

export const metadata: Metadata = serviceMetadata('en', { nl: '/eventfotograaf', en: PATH }, 'Event Photographer', DESCRIPTION)

export default async function EventPhotographerPage() {
  const gallery = await getCachedPortfolioGalleryData()

  return (
    <ServicePage
      locale="en"
      translation={{ href: '/eventfotograaf', label: 'In het Nederlands' }}
      path={PATH}
      title="Event Photographer"
      serviceType="Event photography"
      description={DESCRIPTION}
      photo={pickServicePhoto(gallery.events)}
      paragraphs={[
        <>
          As an event photographer I cover events across the Netherlands and beyond: from TwitchCon at Ahoy and
          Luminiscence in the Nieuwe Kerk to a morning run in the Olympic Stadium and large public and corporate
          productions.
        </>,
        <>
          I work for production companies, brands, agencies and organisations that want images as good as their
          event. Atmosphere, audience, speakers, artists and details — told as one story, not as a loose collection of
          pictures.
        </>,
        <>
          I deliberately focus on productions where image quality really matters. You get the photos quickly and
          neatly organised through my own download portal, ready for socials, press and the recap afterwards.
        </>,
      ]}
      highlights={{
        heading: 'Clients',
        text: 'Ahoy, Talpa, BNN VARA, UNICEF Nederland, North Sea Jazz and many more.',
      }}
      portfolio={{ href: '/portfolio/events', label: 'View event portfolio' }}
      related={[
        { href: '/concert-photographer', label: 'Concert photographer' },
        { href: '/portrait-photographer', label: 'Portrait & set photographer' },
      ]}
    />
  )
}
