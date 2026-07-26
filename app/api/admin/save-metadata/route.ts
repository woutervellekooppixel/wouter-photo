import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { getMetadata, saveMetadata, type UploadMetadata } from "@/lib/r2";
import { isValidSlug, MAX_UPLOAD_FILE_SIZE_BYTES } from "@/lib/validation";
import { DEFAULT_DOWNLOAD_EXPIRY_DAYS } from "@/lib/expiry";

function isSafeObjectKey(key: unknown): key is string {
  if (typeof key !== "string") return false;
  if (!key || key.length > 1024) return false;
  if (key.startsWith("/")) return false;
  if (key.includes("..")) return false;
  if (key.includes("\\")) return false;
  return true;
}

function isSafeFileName(name: unknown): name is string {
  if (typeof name !== "string") return false;
  if (!name || name.length > 1024) return false;
  if (name.includes("\\")) return false;
  if (name.includes("..")) return false;
  return true;
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { slug, title, files, expiresAt, overwrite } = await request.json();

    if (!slug || !Array.isArray(files)) {
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

    // Nooit stilletjes een bestaande transfer overschrijven: dat wist
    // downloadtellingen/ratings en laat de oude bestanden als wezen achter.
    const existing = await getMetadata(slug);
    if (existing && overwrite !== true) {
      return NextResponse.json(
        { error: `Er bestaat al een transfer met de naam "${slug}". Kies een andere naam, of voeg bestanden toe via Bestanden beheren.` },
        { status: 409 }
      );
    }

    const allowedPrefix = `uploads/${slug}/`;
    const seenKeys = new Set<string>();
    for (const file of files) {
      if (!file || typeof file !== "object") {
        return NextResponse.json({ error: "Invalid file entry" }, { status: 400 });
      }
      if (!isSafeObjectKey(file.key) || !file.key.startsWith(allowedPrefix)) {
        return NextResponse.json({ error: "Invalid file key" }, { status: 400 });
      }
      if (!isSafeFileName(file.name)) {
        return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
      }
      if (typeof file.size !== "number" || file.size <= 0 || file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "One or more files exceed the allowed size limit" },
          { status: 413 }
        );
      }
      if (seenKeys.has(file.key)) {
        return NextResponse.json(
          { error: `Duplicate file in upload: ${file.name}` },
          { status: 400 }
        );
      }
      seenKeys.add(file.key);
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
