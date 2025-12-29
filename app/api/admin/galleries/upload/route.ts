import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/r2";
import { requireAdminAuth } from "@/lib/auth";
import { MAX_UPLOAD_FILE_SIZE_BYTES } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string | null;
    if (!file || !category) {
      return NextResponse.json({ error: "file and category required" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    let ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    let key = `${category}/${safeName}`;
    let uploadedKey = key;
    let uploadedName = file.name;

    // Als jpg of png, converteer naar webp en upload alleen webp
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
      const sharp = (await import('sharp')).default;
      const webpBuffer = await sharp(buffer).webp({ quality: 90 }).toBuffer();
      const webpName = safeName.replace(/\.[^.]+$/, '.webp');
      const webpKey = `${category}/${webpName}`;
      await uploadFile(webpBuffer, webpKey, 'image/webp');
      uploadedKey = webpKey;
      uploadedName = webpName;
      // jpg/png niet uploaden, alleen webp
    } else {
      await uploadFile(buffer, key, file.type || `image/${ext}`);
    }

    // Metadata opslaan zodat upload zichtbaar is in admin (zonder expiresAt)
    const now = new Date();
    const metadata = {
      slug: safeName.replace(/\.[^.]+$/, ''),
      createdAt: now.toISOString(),
      files: [{
        key: uploadedKey,
        name: uploadedName,
        size: buffer.length,
        type: 'image/webp',
      }],
      downloads: 0,
      gallery: true,
    };
    const { saveMetadata } = await import('@/lib/r2');
    await saveMetadata(metadata);

    return NextResponse.json({ success: true, key: uploadedKey });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
}
