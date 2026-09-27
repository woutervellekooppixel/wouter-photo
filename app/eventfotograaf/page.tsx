import type { Metadata } from 'next'
import ServicePage, { pickServicePhoto, serviceMetadata } from '@/components/ServicePage'
import { getCachedPortfolioGalleryData } from '@/lib/portfolioCache'

export const revalidate = 3600

const PATH = '/eventfotograaf'
const DESCRIPTION =
  'Wouter Vellekoop is eventfotograaf voor productiebureaus, merken en organisaties door heel Nederland — van TwitchCon in Ahoy tot Luminiscence in de Nieuwe Kerk.'

export const metadata: Metadata = serviceMetadata(PATH, 'Eventfotograaf', DESCRIPTION)

export default async function EventfotograafPage() {
  const gallery = await getCachedPortfolioGalleryData()

  return (
    <ServicePage
      path={PATH}
      title="Eventfotograaf"
      serviceType="Eventfotografie"
      description={DESCRIPTION}
      photo={pickServicePhoto(gallery.events)}
      paragraphs={[
        <>
          Als eventfotograaf leg ik evenementen vast door heel Nederland: van TwitchCon in Ahoy en Luminiscence in de
          Nieuwe Kerk tot een ochtendrun in het Olympisch Stadion en grote publieks- en bedrijfsproducties.
        </>,
        <>
          Ik werk voor productiebureaus, merken, bureaus en organisaties die beelden willen die net zo goed zijn als hun
          event. Sfeer, publiek, sprekers, artiesten en details — verteld als één verhaal, niet als een losse
          verzameling plaatjes.
        </>,
        <>
          Ik kies bewust voor producties waar beeldkwaliteit echt telt. Je krijgt de foto&apos;s snel en overzichtelijk
          via mijn eigen downloadportal, klaar voor socials, pers en het verslag achteraf.
        </>,
      ]}
      highlights={{
        heading: 'Opdrachtgevers',
        text: 'Ahoy, Talpa, BNN VARA, UNICEF Nederland, North Sea Jazz en vele anderen.',
      }}
      portfolio={{ href: '/portfolio/events', label: 'Bekijk eventportfolio' }}
      related={[
        { href: '/concertfotograaf', label: 'Concertfotograaf' },
        { href: '/portretfotograaf', label: 'Portret- en setfotograaf' },
      ]}
    />
  )
}
