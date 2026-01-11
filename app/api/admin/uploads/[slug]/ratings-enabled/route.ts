import { NextResponse, type NextRequest } from "next/server";
import { getMetadata, saveMetadata } from "@/lib/r2";

/**
 * Toggle ratingsEnabled flag for an existing upload (admin).
 * PATCH body: { enabled: boolean }
 * Response: { ok: true, ratingsEnabled: boolean }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { enabled } = (await req.json()) as { enabled?: boolean };
    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Missing enabled:boolean" },
        { status: 400 }
      );
    }

    const meta = await getMetadata(slug);
    if (!meta) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    meta.ratingsEnabled = enabled;
    await saveMetadata(meta);

    return NextResponse.json({ ok: true, ratingsEnabled: enabled });
  } catch (e) {
    console.error("[admin ratings-enabled] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
