import { NextRequest, NextResponse } from 'next/server';
import { getFile } from '@/lib/r2';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Key required' }, { status: 400 });
  }
  try {
    const buffer = await getFile(key);
    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    // Bepaal content-type op basis van extensie
    let contentType = 'application/octet-stream';
    if (key.endsWith('.webp')) contentType = 'image/webp';
    else if (key.endsWith('.jpg') || key.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (key.endsWith('.png')) contentType = 'image/png';
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
