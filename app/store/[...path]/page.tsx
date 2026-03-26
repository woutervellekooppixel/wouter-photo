import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ path: string[] }>;
}

export default async function StoreCatchAllPage({ params }: PageProps) {
  const { path } = await params;
  const suffix = Array.isArray(path) && path.length > 0 ? `/${path.map(encodeURIComponent).join('/')}` : '';
  redirect(`/shop${suffix}`);
}
