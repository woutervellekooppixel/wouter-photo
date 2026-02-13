import { NextRequest, NextResponse } from "next/server";
import { getMetadata, getFileStream, isZipFileValid, getZipSignedUrl, updateDownloadCount } from "@/lib/r2";
import archiver from "archiver";
import { sendDownloadNotification } from "@/lib/email";
import { downloadRateLimit } from "@/lib/rateLimit";
import { isValidSlug } from "@/lib/validation";
import { sortFilesChronological } from "@/lib/utils";
import { isExpired } from "@/lib/expiry";
import { Readable } from "stream";

// Configure route for large downloads
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Rate limiting
  const rateLimitResponse = await downloadRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
    const metadata = await getMetadata(slug);

    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (isExpired(metadata)) {
      return NextResponse.json({ error: "Expired" }, { status: 410 });
    }


    // Update download count with tracking
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await updateDownloadCount(slug, 'all', undefined, ip, userAgent);

    // Send notification email (async, don't wait)
    sendDownloadNotification(slug, metadata.files.length).catch(console.error);

    // If a pre-made ZIP exists and is valid, redirect to a signed R2 URL.
    // This avoids proxying large files through the server (which can truncate/time out).
    const zipIsValid = await isZipFileValid(slug);
    if (zipIsValid) {
      const signedUrl = await getZipSignedUrl(slug, 3600);
      return NextResponse.redirect(signedUrl, { status: 307 });
    }

    // Fallback: create ZIP on-the-fly with streaming

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.on("warning", (err) => {
      console.warn("[Download] ZIP warning:", err);
    });

    // Start adding files to the archive (streamed from R2; no buffering)
    (async () => {
      try {
        const sortedFiles = sortFilesChronological(metadata.files);
        for (const file of sortedFiles) {
          const fileStream = await getFileStream(file.key);
          archive.append(fileStream, { name: file.name });
        }
        await archive.finalize();
      } catch (error) {
        archive.destroy();
      }
    })();

    // Convert Node stream to Web stream (better backpressure handling than manual 'data' events)
    const stream = Readable.toWeb(archive) as unknown as ReadableStream<Uint8Array>;

    // Return the streaming zip file
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${slug}.zip"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}
