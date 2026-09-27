// Next-native llms.txt (served at /llms.txt). Plain-text guide for AI crawlers
// and LLM-based search, following the llms.txt convention.
export const revalidate = 3600

const BASE = 'https://www.wouter.photo'

const body = `# Wouter Vellekoop — Concertfotograaf, eventfotograaf & portretfotograaf

> Wouter Vellekoop is a concertfotograaf, eventfotograaf and portret- en setfotograaf (concert, event, portrait and set photographer) working throughout the Netherlands (door heel Nederland), in Dutch and English. He shoots concerts, festivals, events, portraits of artists and well-known Dutch personalities (BN'ers), set photography for TV, radio and campaign productions, and advertising work — for artists, managements, venues, production companies, brands, agencies and media. He focuses on high-end commissions rather than volume work, with fast delivery via his own download portal. Credits include MOJO, Radio 538, North Sea Jazz, Ahoy, Talpa, BNN VARA, Residentie Orkest and UNICEF Nederland. Available for bookings worldwide.

## Belangrijkste pagina's

- [Home](${BASE}): Overzicht en hero-portfolio van Wouter Vellekoop.
- [Concertfotograaf](${BASE}/concertfotograaf): Concertfotografie voor artiesten, podia, festivals en media door heel Nederland.
- [Eventfotograaf](${BASE}/eventfotograaf): Eventfotografie voor productiebureaus, merken en organisaties door heel Nederland.
- [Portret- en setfotograaf](${BASE}/portretfotograaf): Portretten van artiesten en BN'ers, setfotografie voor tv, radio en campagnes.
- [Concert photographer (EN)](${BASE}/concert-photographer): English version of the concert photography page.
- [Event photographer (EN)](${BASE}/event-photographer): English version of the event photography page.
- [Portrait & set photographer (EN)](${BASE}/portrait-photographer): English version of the portrait and set photography page.
- [About](${BASE}/about): Over Wouter Vellekoop, achtergrond en diensten; beschikbaar voor boekingen wereldwijd.
- [Portfolio](${BASE}/portfolio): Volledige fotografie-galerij — concerten, events en creatief werk.
- [Portfolio — Concerts](${BASE}/portfolio/concerts): Concert- en live-muziekfotografie.
- [Portfolio — Events](${BASE}/portfolio/events): Event- en bedrijfsfotografie.
- [Portfolio — Commercial](${BASE}/portfolio/commercial): Advertising en commercieel werk.
- [Portfolio — Misc](${BASE}/portfolio/misc): Overig en creatief werk.
- [Shop](${BASE}/shop): Presets en tools van Wouter Vellekoop.
- [Stage Fix v6](${BASE}/shop/stage-fix-v6): Preset/tool voor Lightroom en Adobe Camera Raw.
- [BatchCrop](${BASE}/shop/batchcrop): Photoshop-utility die repetitieve crop-workflows versnelt.
- [Export Every X](${BASE}/shop/export-every-x): Photoshop-utility voor batch-export workflows.
- [Photoshop Plugins](${BASE}/plugins): Kleine Photoshop-tools, ook beschikbaar via Adobe Exchange.

## Contact

- Business inquiries: hello@wouter.photo
- Instagram: https://instagram.com/woutervellekoop
- LinkedIn: https://linkedin.com/in/woutervellekoop
`

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
