import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { getFileRange, getMetadata, saveMetadata } from "@/lib/r2";
import { isValidSlug } from "@/lib/validation";
import * as exifr from "exifr";

const EXIF_RANGE = "bytes=0-524287"; // 512KB is usually enough for EXIF headers

function isLikelyImage(name: string) {
  const ext = name.toLowerCase().split(".").pop();
  return [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
    "heic",
    "heif",
    "tif",
    "tiff",
  ].includes(ext || "");
}

function pickBestDate(data: any): Date | null {
  const d: unknown =
    data?.DateTimeOriginal ??
    data?.CreateDate ??
    data?.MediaCreateDate ??
    data?.TrackCreateDate ??
    data?.ModifyDate;

  if (d instanceof Date && Number.isFinite(d.getTime())) return d;
  return null;
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { slug, force } = (await req.json().catch(() => ({}))) as {
      slug?: string;
      force?: boolean;
    };

    if (!slug || !isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    let images = 0;
    let updated = 0;

    for (const file of metadata.files) {
      if (!isLikelyImage(file.name)) continue;
      images++;

      if (!force && file.takenAt) continue;

      try {
        const buf = await getFileRange(file.key, EXIF_RANGE);
        const parsed = await exifr.parse(buf, {
          pick: [
            "DateTimeOriginal",
            "CreateDate",
            "MediaCreateDate",
            "TrackCreateDate",
            "ModifyDate",
          ],
        });

        const best = pickBestDate(parsed);
        if (best) {
          file.takenAt = best.toISOString();
          updated++;
        }
      } catch {
        // Ignore per-file failures; keep going.
      }
    }

    await saveMetadata(metadata);

    return NextResponse.json({ success: true, images, updated });
  } catch (error) {
    console.error("recompute-exif error:", error);
    return NextResponse.json({ error: "Failed to recompute EXIF" }, { status: 500 });
  }
}
