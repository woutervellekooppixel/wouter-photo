// app/portfolio/gallery-data.ts




export async function getGalleryData() {
  // Gebruik BASE_URL op de server, NEXT_PUBLIC_BASE_URL in de browser
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer
    ? process.env.BASE_URL
    : process.env.NEXT_PUBLIC_BASE_URL || '';
  const url = baseUrl ? `${baseUrl}/api/admin/galleries` : '/api/admin/galleries';
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch gallery data');
  return res.json();
}

export default getGalleryData;
