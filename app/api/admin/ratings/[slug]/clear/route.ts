import { NextResponse, type NextRequest } from "next/server";
import { getMetadata, saveMetadata } from "@/lib/r2";
import { requireAdminAuth } from "@/lib/auth";
import { isValidSlug } from "@/lib/validation";

/**
 * Clear all ratings for an existing upload (admin).
 * POST with no body.
 * Response: { ok: true }
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const meta = await getMetadata(slug);
    if (!meta) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    meta.ratings = {};
    await saveMetadata(meta);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin clear ratings] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
