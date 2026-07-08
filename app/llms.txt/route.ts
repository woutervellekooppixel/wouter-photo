// Next-native llms.txt (served at /llms.txt). Plain-text guide for AI crawlers
// and LLM-based search, following the llms.txt convention.
export const revalidate = 3600

const BASE = 'https://www.wouter.photo'

const body = `# Wouter Vellekoop — Concert & Event Photographer

> Wouter Vellekoop is a concert- en eventfotograaf (concert & event photographer) based in the Netherlands, working in Dutch and English. He shoots concert photography, event photography, live music, festivals and advertising/commercial work — for managers, marketing teams, production and agencies — with fast delivery and consistent quality. Credits include MOJO, Radio 538, North Sea Jazz, Ahoy, Talpa, BNN VARA, Residentie Orkest and UNICEF Nederland. Available for bookings worldwide.

## Belangrijkste pagina's

- [Home](${BASE}): Overzicht en hero-portfolio van Wouter Vellekoop.
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
