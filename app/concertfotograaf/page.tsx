import type { Metadata } from 'next'
import ServicePage, { pickServicePhoto, serviceMetadata } from '@/components/ServicePage'
import { getCachedPortfolioGalleryData } from '@/lib/portfolioCache'

export const revalidate = 3600

const PATH = '/concertfotograaf'
const DESCRIPTION =
  'Wouter Vellekoop is concertfotograaf voor artiesten, podia, festivals en media door heel Nederland — van clubshows tot Ziggo Dome, Carré, Ahoy en North Sea Jazz.'

export const metadata: Metadata = serviceMetadata(PATH, 'Concertfotograaf', DESCRIPTION)

export default async function ConcertfotograafPage() {
  const gallery = await getCachedPortfolioGalleryData()

  return (
    <ServicePage
      path={PATH}
      title="Concertfotograaf"
      serviceType="Concertfotografie"
      description={DESCRIPTION}
      photo={pickServicePhoto(gallery.concerts)}
      paragraphs={[
        <>
          Ik ben Wouter Vellekoop, concertfotograaf voor artiesten, managements, podia, festivals en media — door
          heel Nederland. Van kleine clubshows tot Ziggo Dome, Carré en Ahoy, en festivals als North Sea Jazz en Rewire.
        </>,
        <>
          In de pit werk ik snel en onopvallend. Ik ken de dynamiek van een show, weet wat LED-walls en wisselend
          podiumlicht met een beeld doen, en zorg dat de energie van de avond in de foto&apos;s zit — niet alleen
          wie er op het podium stond.
        </>,
        <>
          Ik lever snel en consistent via mijn eigen downloadportal, zodat management, marketing en pers de beelden
          direct kunnen gebruiken voor persberichten, socials en campagnes.
        </>,
      ]}
      highlights={{
        heading: 'Opdrachtgevers',
        text: 'North Sea Jazz, Ahoy, MOJO, Radio 538, Residentie Orkest en vele anderen.',
      }}
      portfolio={{ href: '/portfolio/concerts', label: 'Bekijk concertportfolio' }}
      related={[
        { href: '/eventfotograaf', label: 'Eventfotograaf' },
        { href: '/portretfotograaf', label: 'Portret- en setfotograaf' },
      ]}
    />
  )
}
