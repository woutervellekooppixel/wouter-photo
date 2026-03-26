import { NextResponse, type NextRequest } from "next/server";
import { getMetadata, saveMetadata } from "@/lib/r2";

/**
 * Toggle rating for a single photo on an existing upload (admin).
 * POST body: { fileKey: string, rated: boolean }
 * Response: { ok: true, ratings: Record<string, boolean> }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { fileKey, rated } = (await req.json()) as {
      fileKey?: string;
      rated?: boolean;
    };

    if (!fileKey || typeof rated !== "boolean") {
      return NextResponse.json(
        { error: "Missing fileKey or rated" },
        { status: 400 }
      );
    }

    const meta = await getMetadata(slug);
    if (!meta) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    meta.ratings = meta.ratings || {};
    if (rated) {
      meta.ratings[fileKey] = true;
    } else {
      delete meta.ratings[fileKey];
    }

    await saveMetadata(meta);

    return NextResponse.json({ ok: true, ratings: meta.ratings });
  } catch (e) {
    console.error("[admin rate] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
