import { NextRequest, NextResponse } from 'next/server';
import { getFile } from '@/lib/r2';
import { isValidSlug } from '@/lib/validation';

export const runtime = 'nodejs';

const EXCLUDED_ROOT_PREFIXES = new Set(['backgrounds', 'metadata', 'zips']);
const ALLOWED_IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'heic', 'heif']);

function normalizeKey(raw: string) {
  const key = raw.trim();
  if (!key) return null;
  if (key.startsWith('/')) return null;
  if (key.includes('\\')) return null;
  if (key.includes('..')) return null;
  return key;
}

function getExtLower(key: string) {
  const last = key.split('/').pop() ?? '';
  const ext = last.includes('.') ? last.split('.').pop() : '';
  return (ext ?? '').toLowerCase();
}

function isAllowedKey(key: string) {
  const ext = getExtLower(key);
  if (!ALLOWED_IMAGE_EXTS.has(ext)) return false;

  const parts = key.split('/').filter(Boolean);
  if (parts.length < 2) return false;

  const root = parts[0];
  if (EXCLUDED_ROOT_PREFIXES.has(root)) return false;

  if (root === 'uploads') {
    // uploads/<slug>/<filename>
    const slug = parts[1];
    if (!isValidSlug(slug)) return false;
    return parts.length >= 3;
  }

  // root category style: <category>/<filename>
  // category must be a single segment (no nested folders)
  if (parts.length !== 2) return false;
  return true;
}

function contentTypeFromKey(key: string) {
  const ext = getExtLower(key);
  if (ext === 'webp') return 'image/webp';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'svg') return 'image/svg+xml';
  if (ext === 'bmp') return 'image/bmp';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  return 'application/octet-stream';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawKey = searchParams.get('key');
  if (!rawKey) {
    return NextResponse.json({ error: 'Key required' }, { status: 400 });
  }
  const key = normalizeKey(rawKey);
  if (!key || !isAllowedKey(key)) {
    // Return 404 to avoid confirming object existence.
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const buffer = await getFile(key);
    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const contentType = contentTypeFromKey(key);
    const cacheControl = key.startsWith('uploads/')
      ? 'public, max-age=86400, stale-while-revalidate=604800'
      : 'public, max-age=31536000, immutable';

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
