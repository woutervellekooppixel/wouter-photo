import { NextRequest, NextResponse } from "next/server";
import { getMetadata, getSignedDownloadUrlWithFilename, updateDownloadCount } from "@/lib/r2";
import { downloadRateLimit } from "@/lib/rateLimit";
import { isValidSlug } from "@/lib/validation";
import { isExpired } from "@/lib/expiry";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimitResponse = await downloadRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const fileKey = request.nextUrl.searchParams.get("key");
    if (!fileKey) {
      return NextResponse.json({ error: "File key required" }, { status: 400 });
    }

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (isExpired(metadata)) {
      return NextResponse.json({ error: "Expired" }, { status: 410 });
    }

    const file = metadata.files.find((f) => f.key === fileKey);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    await updateDownloadCount(slug, "single", [fileKey], ip, userAgent);

    // Redirect naar een presigned R2-URL: het bestand gaat rechtstreeks van R2
    // naar de klant (gratis egress) i.p.v. door deze Vercel-functie heen.
    const downloadName = file.name.split("/").pop() || file.name;
    const signedUrl = await getSignedDownloadUrlWithFilename(fileKey, downloadName, 3600);
    return NextResponse.redirect(signedUrl, { status: 307 });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
