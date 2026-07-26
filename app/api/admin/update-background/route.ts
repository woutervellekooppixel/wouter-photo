import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { getMetadata, saveMetadata } from "@/lib/r2";
import { isValidSlug } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { slug, backgroundImageKey } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    // Alleen bestanden die echt in deze transfer zitten
    if (
      backgroundImageKey != null &&
      !metadata.files.some((f) => f.key === backgroundImageKey)
    ) {
      return NextResponse.json({ error: "Unknown file key" }, { status: 400 });
    }

    metadata.backgroundImageKey = backgroundImageKey;
    await saveMetadata(metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating background:", error);
    return NextResponse.json(
      { error: "Failed to update background" },
      { status: 500 }
    );
  }
}
