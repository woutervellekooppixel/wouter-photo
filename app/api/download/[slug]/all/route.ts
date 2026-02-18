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

    // Special case: this download contains only a single ZIP file.
    // In that scenario, creating a new ZIP (containing the ZIP) is wasteful and can time out.
    // Stream the ZIP directly with a proper Content-Disposition.
    const shouldFilterFile = (filename: string) => {
      const name = filename.toLowerCase();
      return [".ds_store", ".xmp", "thumbs.db", "desktop.ini"].some((p) => name.includes(p)) || name.startsWith(".");
    };
    const isImage = (filename: string) => {
      const ext = filename.toLowerCase().split(".").pop();
      return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic", "heif"].includes(ext || "");
    };
    const isZip = (filename: string, contentType?: string) => {
      const ext = filename.toLowerCase().split(".").pop();
      if (ext === "zip") return true;
      if ((contentType || "").toLowerCase().includes("zip")) return true;
      return false;
    };

    const visibleFiles = sortFilesChronological(metadata.files).filter((f) => !shouldFilterFile(f.name));
    const visibleImageFiles = visibleFiles.filter((f) => isImage(f.name));
    const visibleZipFiles = visibleFiles.filter((f) => isZip(f.name, f.type));

    if (visibleImageFiles.length === 0 && visibleFiles.length === 1 && visibleZipFiles.length === 1) {
      const zipFile = visibleZipFiles[0];
      const zipName = zipFile.name.split("/").pop() || `${slug}.zip`;
      const zipStream = await getFileStream(zipFile.key);
      const stream = Readable.toWeb(zipStream) as unknown as ReadableStream<Uint8Array>;
      return new NextResponse(stream, {
        headers: {
          "Content-Type": zipFile.type || "application/zip",
          "Content-Disposition": `attachment; filename="${zipName}"`,
          ...(zipFile.size ? { "Content-Length": zipFile.size.toString() } : {}),
          "Cache-Control": "no-cache",
        },
      });
    }

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
