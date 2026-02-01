import { NextRequest, NextResponse } from "next/server";
import { getFile, getMetadata } from "@/lib/r2";
import { isValidSlug } from "@/lib/validation";
import sharp from "sharp";
import { isExpired } from "@/lib/expiry";

export const runtime = 'nodejs';

const ALLOWED_IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp']);

function getExtLower(key: string) {
  const last = key.split('/').pop() ?? '';
  const ext = last.includes('.') ? last.split('.').pop() : '';
  return (ext ?? '').toLowerCase();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get("key");
    const widthParam = searchParams.get('w');
    const requestedWidth = widthParam ? Number(widthParam) : 640;
    const width = Number.isFinite(requestedWidth)
      ? Math.max(200, Math.min(4096, Math.round(requestedWidth)))
      : 640;

    if (!fileKey) {
      return NextResponse.json({ error: "File key required" }, { status: 400 });
    }

    if (fileKey.includes('..') || fileKey.includes('\\') || fileKey.startsWith('/')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const metadata = await getMetadata(slug);

    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (isExpired(metadata)) {
      return NextResponse.json({ error: "Expired" }, { status: 410 });
    }

    // Find the file
    const file = metadata.files.find((f) => f.key === fileKey);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = getExtLower(fileKey);
    if (!ALLOWED_IMAGE_EXTS.has(ext)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const original = await getFile(fileKey);
    if (!original || original.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const resized = await sharp(original)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();

    return new NextResponse(new Uint8Array(resized), {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error("Thumbnail error:", error);
    return NextResponse.json(
      { error: "Failed to get thumbnail" },
      { status: 500 }
    );
  }
}
