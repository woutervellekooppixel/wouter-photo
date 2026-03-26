import { NextRequest, NextResponse } from 'next/server';
import { getFile } from '@/lib/r2';

export const runtime = 'nodejs';

const ALLOWED_CATEGORIES = new Set(['concerts', 'events', 'misc', 'commercial']);
const ALLOWED_IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp']);

function getExtLower(filename: string) {
  const ext = filename.includes('.') ? filename.split('.').pop() : '';
  return (ext ?? '').toLowerCase();
}

function contentTypeFromFilename(filename: string) {
  const ext = getExtLower(filename);
  if (ext === 'webp') return 'image/webp';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'svg') return 'image/svg+xml';
  if (ext === 'bmp') return 'image/bmp';
  return 'application/octet-stream';
}


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ category: string; filename: string }> }
) {
  const { category, filename } = await context.params;
  const ext = getExtLower(filename);

  if (!ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!ALLOWED_IMAGE_EXTS.has(ext)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const key = `${category}/${filename}`;
  try {
    const buffer = await getFile(key);
    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const contentType = contentTypeFromFilename(filename);
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
