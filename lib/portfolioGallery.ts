import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getGalleryOrder, listFiles, r2Client } from '@/lib/r2';

const EXCLUDED_ROOT_PREFIXES = new Set(['backgrounds', 'metadata', 'uploads', 'zips']);

type Photo = { id: string; src: string; alt: string; category: string; key: string };

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
  const orderData = await getGalleryOrder();
  const result: GalleryData = {};

  const categories = await getCategories();
  for (const cat of categories) {
    let files: string[] = [];
    try {
      files = (await listFiles(`${cat}/`))
        .map((f) => f.split('/').pop()!)
        .filter(Boolean);
    } catch {
      result[cat] = [];
      continue;
    }

    const allPhotos: Photo[] = files
      .filter(
        (f) =>
          (f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.jpeg')) &&
          !f.includes('-blur')
      )
      .map((f) => ({
        id: f,
        src: `/api/photos/by-key?key=${encodeURIComponent(cat + '/' + f)}`,
        alt: f,
        category: cat,
        key: cat + '/' + f,
      }));

    let photos: Photo[] = [];
    if (orderData[cat] && orderData[cat].length > 0) {
      photos = orderData[cat]
        .map((fname) => allPhotos.find((p) => p.id === fname))
        .filter(Boolean) as Photo[];

      const orderedSet = new Set(orderData[cat]);
      const missing = allPhotos.filter((p) => !orderedSet.has(p.id));
      photos = [...photos, ...missing];
    } else {
      photos = allPhotos;
    }

    result[cat] = photos;
  }

  return result;
}
