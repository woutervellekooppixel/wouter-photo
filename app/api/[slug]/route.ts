import { NextRequest, NextResponse } from "next/server";
import { getMetadata } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const metadata = await getMetadata(slug);

    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check expiry
    const now = new Date();
    const expiresAt = new Date(metadata.expiresAt);
    if (now > expiresAt) {
      return NextResponse.json({ error: "Expired" }, { status: 410 });
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Metadata error:", error);
    return NextResponse.json(
      { error: "Failed to load metadata" },
      { status: 500 }
    );
  }
}
