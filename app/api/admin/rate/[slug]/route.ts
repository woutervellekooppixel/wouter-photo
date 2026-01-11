
import { NextResponse, type NextRequest } from "next/server";
import { getMetadata, saveMetadata } from "@/lib/r2";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const meta = await getMetadata(slug);
    if (!meta) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    meta.ratings = {};
    await saveMetadata(meta);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
