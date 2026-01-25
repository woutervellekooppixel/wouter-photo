import { NextRequest, NextResponse } from "next/server";
import { getMetadata } from "@/lib/r2";
import { isValidSlug } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const metadata = await getMetadata(slug);

    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }


    // Redact sensitive fields (file keys can be used to enumerate objects).
    const publicMetadata = {
      slug: metadata.slug,
      title: metadata.title ?? metadata.slug,
      createdAt: metadata.createdAt,
      expiresAt: metadata.expiresAt,
      downloads: metadata.downloads,
      ratingsEnabled: metadata.ratingsEnabled ?? false,
      filesCount: metadata.files?.length ?? 0,
      files: (metadata.files ?? []).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        takenAt: f.takenAt,
      })),
    };

    return NextResponse.json(publicMetadata);
  } catch (error) {
    console.error("Metadata error:", error);
    return NextResponse.json(
      { error: "Failed to load metadata" },
      { status: 500 }
    );
  }
}
