import { NextRequest, NextResponse } from 'next/server';
import { getFile } from '@/lib/r2';

export const runtime = 'nodejs';


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ category: string; filename: string }> }
) {
  const { category, filename } = await context.params;
  const key = `${category}/${filename}`;
  console.log('[PHOTO API] Request:', { category, filename, key });
  try {
    const buffer = await getFile(key);
    if (!buffer || buffer.length === 0) {
      console.log('[PHOTO API] File not found or empty:', key);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    // Bepaal content-type op basis van extensie
    let contentType = 'application/octet-stream';
    if (filename.endsWith('.webp')) contentType = 'image/webp';
    else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filename.endsWith('.png')) contentType = 'image/png';
    console.log('[PHOTO API] Success:', { key, contentType, size: buffer.length });
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e: any) {
    console.log('[PHOTO API] ERROR:', { key, error: e?.message || e });
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
