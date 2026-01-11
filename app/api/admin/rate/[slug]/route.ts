import { NextResponse } from "next/server";
import { getMetadata, saveMetadata } from "@/lib/r2";

/** POST body: { fileKey: string, rated: boolean } */
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { fileKey, rated } = (await req.json()) as { fileKey?: string; rated?: boolean };

    if (!fileKey || typeof rated !== "boolean") {
      return NextResponse.json({ error: "Missing fileKey or rated" }, { status: 400 });
    }

    const meta = await getMetadata(slug);
    if (!meta) return NextResponse.json({ error: "Not found" }, { status: 404 });

    meta.ratings = meta.ratings || {};
    if (rated) meta.ratings[fileKey] = true;
    else delete meta.ratings[fileKey];

    await saveMetadata(meta);

    return NextResponse.json({ ok: true, ratings: meta.ratings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
