import { NextRequest, NextResponse } from "next/server";
import {
  getMetadata,
  getFileStream,
  isZipFileValid,
  getZipSignedUrl,
  getSignedDownloadUrlWithFilename,
  updateDownloadCount,
  createZipFile,
  tryAcquireZipLock,
  releaseZipLock,
  MAX_STREAMING_ZIP_BYTES,
} from "@/lib/r2";
import archiver from "archiver";
import { sendDownloadNotification } from "@/lib/email";
import { downloadRateLimit } from "@/lib/rateLimit";
import { isValidSlug } from "@/lib/validation";
import { sortFilesChronological, shouldFilterFile, isImageFile, isZipFile } from "@/lib/utils";
import { isExpired } from "@/lib/expiry";
import { Readable } from "stream";
import { waitUntil } from "@vercel/functions";

// Configure route for large downloads
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

// Genereer de kant-en-klare ZIP op de achtergrond (na de response) en geef
// de klant een "wordt voorbereid"-status i.p.v. een afgekapte stream.
function kickZipGeneration(slug: string) {
  const job = (async () => {
    if (!(await tryAcquireZipLock(slug))) return;
    try {
      await createZipFile(slug);
    } catch (err) {
      console.error(`[Download] Background zip generation failed for ${slug}:`, err);
    } finally {
      await releaseZipLock(slug);
    }
  })();
  try {
    waitUntil(job);
  } catch {
    // Buiten Vercel (lokaal): laat de promise gewoon lopen.
    job.catch(() => {});
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Rate limiting
  const rateLimitResponse = await downloadRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // mode=json: de client haalt eerst dit antwoord op (zelfde origin, dus
  // foutstatussen zijn leesbaar) en navigeert daarna zelf naar de URL.
  const wantsJson = request.nextUrl.searchParams.get("mode") === "json";

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


    // skipcount=1: de tweede hop van een mode=json-flow — al geteld/gemaild.
    const skipCount = request.nextUrl.searchParams.get("skipcount") === "1";
    if (!skipCount) {
      // Update download count with tracking
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      await updateDownloadCount(slug, 'all', undefined, ip, userAgent);

      // Send notification email (async, don't wait)
      sendDownloadNotification(slug, metadata.files.length).catch(console.error);
    }

    // Special case: this download contains only a single ZIP file.
    // In that scenario, creating a new ZIP (containing the ZIP) is wasteful and can time out.
    const visibleFiles = sortFilesChronological(metadata.files).filter((f) => !shouldFilterFile(f.name));
    const visibleImageFiles = visibleFiles.filter((f) => isImageFile(f.name));
    const visibleZipFiles = visibleFiles.filter((f) => isZipFile(f.name, f.type));

    if (visibleImageFiles.length === 0 && visibleFiles.length === 1 && visibleZipFiles.length === 1) {
      const zipFile = visibleZipFiles[0];
      const zipName = zipFile.name.split("/").pop() || `${slug}.zip`;
      const signedUrl = await getSignedDownloadUrlWithFilename(zipFile.key, zipName, 3600);
      if (wantsJson) return NextResponse.json({ url: signedUrl });
      return NextResponse.redirect(signedUrl, { status: 307 });
    }

    // If a pre-made ZIP exists and is valid, redirect to a signed R2 URL.
    // This avoids proxying large files through the server (which can truncate/time out).
    const zipIsValid = await isZipFileValid(slug);
    if (zipIsValid) {
      const signedUrl = await getZipSignedUrl(slug, 3600);
      if (wantsJson) return NextResponse.json({ url: signedUrl });
      return NextResponse.redirect(signedUrl, { status: 307 });
    }

    // Geen kant-en-klare ZIP. Boven de streaming-grens NIET on-the-fly
    // streamen (dat wordt bij maxDuration afgekapt en levert een kapotte
    // ZIP op die er normaal uitziet) — genereer op de achtergrond en meld
    // dat de ZIP wordt voorbereid.
    const totalBytes = metadata.files.reduce((acc, f) => acc + (f.size || 0), 0);
    if (totalBytes > MAX_STREAMING_ZIP_BYTES) {
      kickZipGeneration(slug);
      const body = {
        preparing: true,
        error: "ZIP is being prepared. Please try again in a few minutes.",
      };
      return NextResponse.json(body, { status: 202 });
    }

    if (wantsJson) {
      // Klein genoeg om te streamen: laat de client dit endpoint zonder
      // mode=json als navigatie openen.
      return NextResponse.json({ stream: true });
    }

    // Fallback: create ZIP on-the-fly with streaming.
    // STORE i.p.v. compressie: foto's zijn al gecomprimeerd, en minder CPU
    // betekent minder kans om tegen maxDuration aan te lopen.
    const archive = archiver("zip", { zlib: { level: 0 }, store: true });
    archive.on("warning", (err) => {
      console.warn("[Download] ZIP warning:", err);
    });
    archive.on("error", (err) => {
      console.error("[Download] ZIP error:", err);
      archive.destroy();
    });

    // Start adding files to the archive (one source stream at a time)
    (async () => {
      try {
        const entryDone = () =>
          new Promise<void>((resolve) => archive.once("entry", () => resolve()));
        const sortedFiles = sortFilesChronological(metadata.files);
        for (const file of sortedFiles) {
          const fileStream = await getFileStream(file.key);
          const done = entryDone();
          archive.append(fileStream, { name: file.name });
          await done;
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
