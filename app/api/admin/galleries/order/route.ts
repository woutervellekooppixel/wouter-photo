import { NextResponse } from 'next/server';
import { getGalleryOrder, setGalleryOrder } from '@/lib/r2';

const CATEGORIES = ['concerts', 'events', 'misc'];

export async function POST(req: Request) {
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
