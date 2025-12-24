import { NextRequest, NextResponse } from 'next/server';
import { getFile } from '@/lib/r2';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ category: string; filename: string }> }
) {
  const { category, filename } = await context.params;
  const key = `${category}/${filename}`;
  try {
    const buffer = await getFile(key);
    // Bepaal content-type op basis van extensie
    let contentType = 'application/octet-stream';
    if (filename.endsWith('.webp')) contentType = 'image/webp';
    else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filename.endsWith('.png')) contentType = 'image/png';
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
