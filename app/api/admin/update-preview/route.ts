import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { getMetadata, saveMetadata } from "@/lib/r2";

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { slug, previewImageKey } = await request.json();

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json(
        { error: "Upload not found" },
        { status: 404 }
      );
    }

    metadata.previewImageKey = previewImageKey;
    await saveMetadata(metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update preview error:", error);
    return NextResponse.json(
      { error: "Failed to update preview image" },
      { status: 500 }
    );
  }
}
