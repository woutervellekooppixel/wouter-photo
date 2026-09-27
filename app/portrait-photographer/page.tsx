import type { Metadata } from 'next'
import ServicePage, { pickServicePhoto, serviceMetadata } from '@/components/ServicePage'
import { getCachedPortfolioGalleryData } from '@/lib/portfolioCache'

export const revalidate = 3600

const PATH = '/portrait-photographer'
const DESCRIPTION =
  'Wouter Vellekoop photographs artists and well-known Dutch personalities, and works as a set photographer on TV, radio and campaign productions — across the Netherlands and beyond.'

export const metadata: Metadata = serviceMetadata('en', { nl: '/portretfotograaf', en: PATH }, 'Portrait & Set Photographer', DESCRIPTION)

export default async function PortraitPhotographerPage() {
  const gallery = await getCachedPortfolioGalleryData()

  return (
    <ServicePage
      locale="en"
      translation={{ href: '/portretfotograaf', label: 'In het Nederlands' }}
      path={PATH}
      title="Portrait & Set Photographer"
      serviceType="Portrait photography and set photography"
      description={DESCRIPTION}
      photo={pickServicePhoto(gallery.misc)}
      paragraphs={[
        <>
          I photograph artists, well-known Dutch personalities and creators: press photos, artwork, campaign imagery
          and editorial portraits — across the Netherlands and beyond, on location or on set.
        </>,
        <>
          I also work as a set photographer on TV, radio and campaign productions. Stills and behind-the-scenes that
          show what happens in front of and behind the camera, without getting in the way of the production.
        </>,
        <>
          I deliberately don&apos;t do assembly-line portraits. I choose commissions where every image counts: a clear
          idea, good light and attention for the person in front of the lens.
        </>,
      ]}
      highlights={{
        heading: 'Clients',
        text: 'Radio 538, Talpa, BNN VARA, MOJO and many more.',
      }}
      portfolio={{ href: '/portfolio/misc', label: 'View portfolio' }}
      related={[
        { href: '/concert-photographer', label: 'Concert photographer' },
        { href: '/event-photographer', label: 'Event photographer' },
      ]}
    />
  )
}
