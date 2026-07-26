import { NextResponse } from 'next/server';
import { getGalleryOrder, setGalleryOrder } from '@/lib/r2';
import { requireAdminAuth } from '@/lib/auth';

const CATEGORIES = ['concerts', 'events', 'misc'];

export async function POST(req: Request) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const body = await req.json();
  const { category, order } = body;
  if (!CATEGORIES.includes(category) || !Array.isArray(order)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  let data = await getGalleryOrder();
  data[category] = order;
  await setGalleryOrder(data);
  return NextResponse.json({ success: true });
}
