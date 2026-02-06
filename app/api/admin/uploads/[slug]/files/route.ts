import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { deleteFile, getMetadata, saveMetadata, type UploadMetadata } from "@/lib/r2";
import { isValidSlug, MAX_UPLOAD_FILE_SIZE_BYTES } from "@/lib/validation";

type IncomingFile = {
  key: string;
  name: string;
  size: number;
  type: string;
  takenAt?: string;
};

function isSafeObjectKey(key: string) {
  if (typeof key !== "string") return false;
  if (!key || key.length > 1024) return false;
  if (key.startsWith("/")) return false;
  if (key.includes("..")) return false;
  if (key.includes("\\")) return false;
  return true;
}

function isSafeFileName(name: string) {
  if (typeof name !== "string") return false;
  if (!name || name.length > 1024) return false;
  if (name.includes("\\")) return false;
  if (name.includes("..")) return false;
  return true;
}

async function invalidateZip(slug: string) {
  try {
    await deleteFile(`zips/${slug}.zip`);
  } catch {
    // best-effort
  }
}

function removeKeysFromMetadata(metadata: UploadMetadata, removedKeys: Set<string>) {
  if (metadata.previewImageKey && removedKeys.has(metadata.previewImageKey)) {
    delete (metadata as any).previewImageKey;
  }
  if (metadata.backgroundImageKey && removedKeys.has(metadata.backgroundImageKey)) {
    delete (metadata as any).backgroundImageKey;
  }
  if (metadata.ratings) {
    for (const key of removedKeys) {
      delete metadata.ratings[key];
    }
    if (Object.keys(metadata.ratings).length === 0) {
      delete (metadata as any).ratings;
    }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const files: IncomingFile[] | undefined = body?.files;

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "Files array required" }, { status: 400 });
    }

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const allowedPrefix = `uploads/${slug}/`;
    const existingKeys = new Set(metadata.files.map((f) => f.key));

    const toAdd: UploadMetadata["files"] = [];
    for (const f of files) {
      if (!f || typeof f !== "object") {
        return NextResponse.json({ error: "Invalid file entry" }, { status: 400 });
      }
      if (!isSafeObjectKey(f.key) || !f.key.startsWith(allowedPrefix)) {
        return NextResponse.json({ error: "Invalid file key" }, { status: 400 });
      }
      if (!isSafeFileName(f.name)) {
        return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
      }
      if (typeof f.size !== "number" || f.size <= 0 || f.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
      }
      if (typeof f.type !== "string") {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      }
      if (existingKeys.has(f.key)) {
        return NextResponse.json({ error: `File already exists: ${f.name}` }, { status: 409 });
      }

      toAdd.push({
        key: f.key,
        name: f.name,
        size: f.size,
        type: f.type || "application/octet-stream",
        ...(typeof f.takenAt === "string" && f.takenAt.trim() ? { takenAt: f.takenAt } : {}),
      });
    }

    metadata.files = [...metadata.files, ...toAdd];
    await saveMetadata(metadata);
    await invalidateZip(slug);

    return NextResponse.json({
      success: true,
      added: toAdd.length,
      totalFiles: metadata.files.length,
    });
  } catch (error) {
    console.error("Error appending files:", error);
    return NextResponse.json({ error: "Failed to append files" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const keys: string[] | undefined = body?.keys;
    const hardDelete: boolean = body?.hardDelete !== false;

    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: "Keys array required" }, { status: 400 });
    }

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const allowedPrefix = `uploads/${slug}/`;
    const keySet = new Set(
      keys.filter((k) => typeof k === "string" && isSafeObjectKey(k) && k.startsWith(allowedPrefix))
    );

    if (keySet.size === 0) {
      return NextResponse.json({ error: "No valid keys" }, { status: 400 });
    }

    const existingKeys = new Set(metadata.files.map((f) => f.key));
    const removable = new Set([...keySet].filter((k) => existingKeys.has(k)));

    if (removable.size === 0) {
      return NextResponse.json({ error: "No matching files found" }, { status: 404 });
    }

    metadata.files = metadata.files.filter((f) => !removable.has(f.key));
    removeKeysFromMetadata(metadata, removable);

    let deletedCount = 0;
    if (hardDelete) {
      for (const key of removable) {
        try {
          await deleteFile(key);
          deletedCount++;
        } catch (err) {
          console.error("Failed to delete object:", key, err);
        }
      }
    }

    await saveMetadata(metadata);
    await invalidateZip(slug);

    return NextResponse.json({
      success: true,
      removed: removable.size,
      hardDeleted: hardDelete,
      hardDeletedCount: deletedCount,
      totalFiles: metadata.files.length,
    });
  } catch (error) {
    console.error("Error removing files:", error);
    return NextResponse.json({ error: "Failed to remove files" }, { status: 500 });
  }
}
