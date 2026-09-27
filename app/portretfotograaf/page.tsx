import type { Metadata } from 'next'
import ServicePage, { pickServicePhoto, serviceMetadata } from '@/components/ServicePage'
import { getCachedPortfolioGalleryData } from '@/lib/portfolioCache'

export const revalidate = 3600

const PATH = '/portretfotograaf'
const DESCRIPTION =
  'Wouter Vellekoop maakt portretten van artiesten en bekende Nederlanders, en werkt als setfotograaf bij tv-, radio- en campagneproducties — door heel Nederland.'

export const metadata: Metadata = serviceMetadata(PATH, 'Portret- en setfotograaf', DESCRIPTION)

export default async function PortretfotograafPage() {
  const gallery = await getCachedPortfolioGalleryData()

  return (
    <ServicePage
      path={PATH}
      title="Portret- en setfotograaf"
      serviceType="Portretfotografie en setfotografie"
      description={DESCRIPTION}
      photo={pickServicePhoto(gallery.misc)}
      paragraphs={[
        <>
          Ik maak portretten van artiesten, bekende Nederlanders en makers: persfoto&apos;s, artwork, campagnebeeld en
          redactionele portretten — door heel Nederland, op locatie of op set.
        </>,
        <>
          Daarnaast werk ik als setfotograaf bij tv-, radio- en campagneproducties. Stills en behind-the-scenes die
          laten zien wat er gebeurt vóór en achter de camera, zonder de productie in de weg te zitten.
        </>,
        <>
          Ik doe bewust geen portretten aan de lopende band. Ik kies voor opdrachten waarin elk beeld telt: een eigen
          idee, goed licht en aandacht voor de persoon voor de lens.
        </>,
      ]}
      highlights={{
        heading: 'Opdrachtgevers',
        text: 'Radio 538, Talpa, BNN VARA, MOJO en vele anderen.',
      }}
      portfolio={{ href: '/portfolio/misc', label: 'Bekijk portfolio' }}
      related={[
        { href: '/concertfotograaf', label: 'Concertfotograaf' },
        { href: '/eventfotograaf', label: 'Eventfotograaf' },
      ]}
    />
  )
}
