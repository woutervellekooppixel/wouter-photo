import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getGalleryOrder, listFiles, r2Client } from '@/lib/r2';
import { photoAltFromFilename } from '@/lib/utils';

const EXCLUDED_ROOT_PREFIXES = new Set(['backgrounds', 'metadata', 'uploads', 'zips']);

export type Photo = { id: string; src: string; alt: string; category: string; key: string; blurDataURL?: string };

type GalleryData = Record<string, Photo[]>;

async function getCategories(): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME!,
    Delimiter: '/',
    Prefix: '',
  });
  const response = await r2Client.send(command);

  return (response.CommonPrefixes || [])
    .map((p) => p.Prefix?.replace(/\/$/, ''))
    .filter(Boolean)
    .filter((prefix) => !EXCLUDED_ROOT_PREFIXES.has(prefix as string)) as string[];
}

export async function getPortfolioGalleryData(): Promise<GalleryData> {
  const [orderData, categories] = await Promise.all([getGalleryOrder(), getCategories()]);
  const result: GalleryData = {};
  // Preserve storage/category ordering even when requests finish out of order.
  for (const category of categories) result[category] = [];

  await Promise.all(categories.map(async (cat) => {
    // Let storage failures propagate so ISR retains the last successful page.
    const files = (await listFiles(`${cat}/`))
        .map((f) => f.split('/').pop()!)
        .filter(Boolean);

    const allPhotos: Photo[] = files
      .filter(
        (f) =>
          (f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.jpeg')) &&
          !f.includes('-blur')
      )
      .map((f) => ({
        id: f,
        src: `/api/photos/${encodeURIComponent(cat)}/${encodeURIComponent(f)}`,
        alt: photoAltFromFilename(f, cat),
        category: cat,
        key: cat + '/' + f,
      }));

    let photos: Photo[] = [];
    if (orderData[cat] && orderData[cat].length > 0) {
      const byId = new Map(allPhotos.map((photo) => [photo.id, photo]));
      photos = orderData[cat]
        .map((fname) => byId.get(fname))
        .filter(Boolean) as Photo[];

      const orderedSet = new Set(orderData[cat]);
      const missing = allPhotos.filter((p) => !orderedSet.has(p.id));
      photos = [...photos, ...missing];
    } else {
      photos = allPhotos;
    }

    result[cat] = photos;
  }));

  return result;
}
