import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { saveMetadata, type UploadMetadata } from "@/lib/r2";
import { isValidSlug, MAX_UPLOAD_FILE_SIZE_BYTES } from "@/lib/validation";
import { DEFAULT_DOWNLOAD_EXPIRY_DAYS } from "@/lib/expiry";

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { slug, title, files, ratingsEnabled, expiresAt } = await request.json();

    if (!slug || !files || files.length === 0) {
      return NextResponse.json(
        { error: "Slug and files are required" },
        { status: 400 }
      );
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: "Invalid slug" },
        { status: 400 }
      );
    }

    if (!Array.isArray(files)) {
      return NextResponse.json(
        { error: "Files must be an array" },
        { status: 400 }
      );
    }

    if (files.some((file: { size?: number }) => typeof file.size !== "number" || file.size <= 0 || file.size > MAX_UPLOAD_FILE_SIZE_BYTES)) {
      return NextResponse.json(
        { error: "One or more files exceed the allowed size limit" },
        { status: 413 }
      );
    }

    const now = new Date();

    let resolvedExpiresAt: string | undefined;
    if (typeof expiresAt === 'string' && expiresAt.trim()) {
      const d = new Date(expiresAt);
      if (Number.isFinite(d.getTime())) {
        resolvedExpiresAt = d.toISOString();
      }
    }
    if (!resolvedExpiresAt) {
      const d = new Date(now.getTime());
      d.setUTCDate(d.getUTCDate() + DEFAULT_DOWNLOAD_EXPIRY_DAYS);
      resolvedExpiresAt = d.toISOString();
    }

    const metadata: UploadMetadata = {
      slug,
      ...(title && { title }),
      createdAt: now.toISOString(),
      expiresAt: resolvedExpiresAt,
      files: files,
      downloads: 0,
      ...(ratingsEnabled && { ratingsEnabled }),
    };

    await saveMetadata(metadata);

    return NextResponse.json({
      success: true,
      url: `/${slug}`,
    });
  } catch (error) {
    console.error("Error saving metadata:", error);
    return NextResponse.json(
      { error: "Failed to save upload metadata" },
      { status: 500 }
    );
  }
}
