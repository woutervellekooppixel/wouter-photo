import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { getMetadata, getFileStream, updateDownloadCount } from "@/lib/r2";
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

    const nodeStream = await getFileStream(fileKey);
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.name}"`,
        ...(file.size ? { "Content-Length": file.size.toString() } : {}),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
