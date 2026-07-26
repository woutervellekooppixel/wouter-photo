import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { deleteUpload, getMetadata, saveMetadata } from "@/lib/r2";
import { isValidSlug } from "@/lib/validation";

// Vervaldatum aanpassen/verlengen van een bestaande transfer
export async function PATCH(
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

    const body = await request.json().catch(() => ({}));
    const { expiresAt, extendDays, title, useDefaultHero } = body || {};

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (typeof extendDays === "number" && Number.isFinite(extendDays) && extendDays > 0) {
      // Verlengen vanaf nu of vanaf huidige vervaldatum, wat later is
      const base = metadata.expiresAt ? new Date(metadata.expiresAt) : new Date();
      const from = base.getTime() > Date.now() ? base : new Date();
      const d = new Date(from.getTime());
      d.setUTCDate(d.getUTCDate() + Math.min(Math.round(extendDays), 365));
      metadata.expiresAt = d.toISOString();
    } else if (typeof expiresAt === "string" && expiresAt.trim()) {
      const d = new Date(expiresAt);
      if (!Number.isFinite(d.getTime())) {
        return NextResponse.json({ error: "Invalid expiresAt" }, { status: 400 });
      }
      metadata.expiresAt = d.toISOString();
    }

    if (typeof title === "string") {
      metadata.title = title.trim() || undefined;
    }

    if (typeof useDefaultHero === "boolean") {
      if (useDefaultHero) metadata.useDefaultHero = true;
      else delete metadata.useDefaultHero;
    }

    await saveMetadata(metadata);
    return NextResponse.json({ success: true, expiresAt: metadata.expiresAt });
  } catch (error) {
    console.error("Error updating upload:", error);
    return NextResponse.json({ error: "Failed to update upload" }, { status: 500 });
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
    await deleteUpload(slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting upload:", error);
    return NextResponse.json(
      { error: "Failed to delete upload" },
      { status: 500 }
    );
  }
}
