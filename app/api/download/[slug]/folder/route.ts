import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import archiver from "archiver";
import {
  getMetadata,
  getFileStream,
  updateDownloadCount,
  getFolderZipKey,
  isZipObjectValid,
  getSignedDownloadUrlWithFilename,
  createFolderZipFile,
  tryAcquireZipLock,
  releaseZipLock,
  MAX_STREAMING_ZIP_BYTES,
} from "@/lib/r2";
import { downloadRateLimit } from "@/lib/rateLimit";
import { isValidSlug } from "@/lib/validation";
import { isExpired } from "@/lib/expiry";
import { sortFilesChronological } from "@/lib/utils";
import { sendDownloadNotification } from "@/lib/email";
import { waitUntil } from "@vercel/functions";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function kickFolderZipGeneration(slug: string, folderPath: string) {
  const job = (async () => {
    // Lock per transfer volstaat: generatie is toch snel achter elkaar klaar.
    if (!(await tryAcquireZipLock(slug))) return;
    try {
      await createFolderZipFile(slug, folderPath);
    } catch (err) {
      console.error(`[FolderDownload] Background zip generation failed for ${slug}/${folderPath}:`, err);
    } finally {
      await releaseZipLock(slug);
    }
  })();
  try {
    waitUntil(job);
  } catch {
    job.catch(() => {});
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimitResponse = await downloadRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const wantsJson = request.nextUrl.searchParams.get("mode") === "json";

  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const folderPath = request.nextUrl.searchParams.get("path");
    if (!folderPath) {
      return NextResponse.json({ error: "Folder path is required" }, { status: 400 });
    }

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }
    if (isExpired(metadata)) {
      return NextResponse.json({ error: "Expired" }, { status: 410 });
    }

    const folderFiles = sortFilesChronological(
      metadata.files.filter((file) => {
        const fileFolderPath = file.name.includes("/")
          ? file.name.substring(0, file.name.lastIndexOf("/"))
          : "";
        return fileFolderPath === folderPath || fileFolderPath.startsWith(folderPath + "/");
      })
    );

    if (folderFiles.length === 0) {
      return NextResponse.json({ error: "No files found in this folder" }, { status: 404 });
    }

    // skipcount=1: de tweede hop van een mode=json-flow — al geteld/gemaild.
    if (request.nextUrl.searchParams.get("skipcount") !== "1") {
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";
      await updateDownloadCount(slug, "folder", folderFiles.map((f) => f.key), ip, userAgent);
      sendDownloadNotification(slug, folderFiles.length).catch(console.error);
    }

    // Kant-en-klare map-zip in R2? Redirect: download gaat dan rechtstreeks
    // uit R2 (gratis egress) i.p.v. hier gestreamd te worden.
    const safeFolderZipName = `${folderPath.replace(/[^a-zA-Z0-9-_]/g, "-")}.zip`;
    const folderZipKey = getFolderZipKey(slug, folderPath);
    if (await isZipObjectValid(folderZipKey)) {
      const signedUrl = await getSignedDownloadUrlWithFilename(folderZipKey, safeFolderZipName, 3600);
      if (wantsJson) return NextResponse.json({ url: signedUrl });
      return NextResponse.redirect(signedUrl, { status: 307 });
    }

    // Geen kant-en-klare zip: boven de streaming-grens voorbereiden i.p.v.
    // een (bij maxDuration afgekapte) kapotte ZIP streamen.
    const totalBytes = folderFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    if (totalBytes > MAX_STREAMING_ZIP_BYTES) {
      kickFolderZipGeneration(slug, folderPath);
      return NextResponse.json(
        { preparing: true, error: "ZIP is being prepared. Please try again in a few minutes." },
        { status: 202 }
      );
    }

    if (wantsJson) {
      return NextResponse.json({ stream: true });
    }

    // STORE i.p.v. compressie (zie all/route.ts)
    const archive = archiver("zip", { zlib: { level: 0 }, store: true });
    archive.on("warning", (err) => console.warn("[FolderDownload] ZIP warning:", err));
    archive.on("error", (err) => {
      console.error("[FolderDownload] ZIP error:", err);
      archive.destroy();
    });

    (async () => {
      try {
        const entryDone = () =>
          new Promise<void>((resolve) => archive.once("entry", () => resolve()));
        for (const file of folderFiles) {
          // Preserve subfolder structure relative to the requested folder.
          // e.g. folderPath="Wedding", file.name="Wedding/Ceremony/img001.jpg" → "Ceremony/img001.jpg"
          const relativePath = file.name.startsWith(folderPath + "/")
            ? file.name.slice(folderPath.length + 1)
            : (file.name.split("/").pop() || file.name);
          const fileStream = await getFileStream(file.key);
          const done = entryDone();
          archive.append(fileStream, { name: relativePath });
          await done;
        }
        await archive.finalize();
      } catch (error) {
        archive.destroy();
      }
    })();

    const webStream = Readable.toWeb(archive) as unknown as ReadableStream<Uint8Array>;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeFolderZipName}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error creating folder ZIP:", error);
    return NextResponse.json({ error: "Failed to create folder download" }, { status: 500 });
  }
}
