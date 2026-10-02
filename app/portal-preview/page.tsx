import { notFound } from 'next/navigation'
import DownloadGallery from '@/app/[slug]/download-gallery'

// Dev-only preview van de klant-downloadpagina met mock-data (incl. intro).
// Bestaat niet op productie.
export default function PortalPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  const mk = (name: string, size = 4_200_000, daysAgo = 10) => ({
    key: `uploads/portal-preview/${name}`,
    name,
    size,
    type: 'image/jpeg',
    takenAt: new Date(Date.now() - daysAgo * 864e5).toISOString(),
  })

  const metadata = {
    slug: 'portal-preview',
    title: 'Kane — Ahoy Rotterdam',
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    files: [
      mk('Show/kane-01.jpg', 4_200_000, 2),
      mk('Show/kane-02.jpg', 3_900_000, 2),
      mk('Show/kane-03.jpg', 4_600_000, 2),
      mk('Show/kane-04.jpg', 4_100_000, 2),
      mk('Show/kane-05.jpg', 3_800_000, 2),
      mk('Show/kane-06.jpg', 4_400_000, 2),
      mk('Backstage/backstage-01.jpg', 3_500_000, 2),
      mk('Backstage/backstage-02.jpg', 3_700_000, 2),
      mk('Backstage/backstage-03.jpg', 3_300_000, 2),
      mk('Backstage/backstage-04.jpg', 3_600_000, 2),
      { key: 'uploads/portal-preview/Kane-Ahoy-selects.zip', name: 'Kane-Ahoy-selects.zip', size: 1_200_000_000, type: 'application/zip' },
      { key: 'uploads/portal-preview/Persbericht.pdf', name: 'Persbericht.pdf', size: 240_000, type: 'application/pdf' },
    ],
  }

  const expiresAt = new Date(Date.now() + 21 * 864e5).toISOString()

  return <DownloadGallery metadata={metadata} expiresAt={expiresAt} />
}
