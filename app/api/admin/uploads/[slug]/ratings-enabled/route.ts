import { NextResponse } from "next/server";
import { getMetadata, saveMetadata } from "@/lib/r2";

export async function PATCH(req: Request, context: { params: { slug: string } }) {
  try {
    const { slug } = context.params;
    const body = await req.json().catch(() => ({}));
    const { enabled } = body as { enabled?: boolean };

    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Missing enabled:boolean" }, { status: 400 });
    }

    const meta = await getMetadata(slug);
    if (!meta) return NextResponse.json({ error: "Not found" }, { status: 404 });

    meta.ratingsEnabled = enabled;
    await saveMetadata(meta);

    return NextResponse.json({ ok: true, ratingsEnabled: enabled });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
