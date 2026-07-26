import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import archiver from "archiver";
import { getMetadata, getFileStream, updateDownloadCount } from "@/lib/r2";
import { downloadRateLimit } from "@/lib/rateLimit";
import { isValidSlug } from "@/lib/validation";
import { isExpired } from "@/lib/expiry";
import { sortFilesChronological } from "@/lib/utils";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(
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

    const { fileKeys } = await request.json();
    if (!fileKeys || !Array.isArray(fileKeys) || fileKeys.length === 0) {
      return NextResponse.json({ error: "File keys required" }, { status: 400 });
    }

    const metadata = await getMetadata(slug);
    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (isExpired(metadata)) {
      return NextResponse.json({ error: "Expired" }, { status: 410 });
    }

    const selectedFiles = sortFilesChronological(
      metadata.files.filter((f) => fileKeys.includes(f.key))
    );
    if (selectedFiles.length === 0) {
      return NextResponse.json({ error: "No valid files found" }, { status: 404 });
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    await updateDownloadCount(slug, "selected", fileKeys, ip, userAgent);

    // Serverlimiet naast de clientlimiet: nooit een selectie streamen die
    // de maxDuration niet haalt (zou een stil afgekapte ZIP opleveren).
    const totalBytes = selectedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    if (totalBytes > 1.5 * 1024 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Selection too large — use the folder or Download All buttons." },
        { status: 413 }
      );
    }

    // STORE i.p.v. compressie: foto's zijn al gecomprimeerd; minder CPU =
    // minder kans op een timeout halverwege de stream.
    const archive = archiver("zip", { zlib: { level: 0 }, store: true });
    archive.on("warning", (err) => console.warn("[SelectedDownload] ZIP warning:", err));
    archive.on("error", (err) => {
      console.error("[SelectedDownload] ZIP error:", err);
      archive.destroy();
    });

    (async () => {
      try {
        const entryDone = () =>
          new Promise<void>((resolve) => archive.once("entry", () => resolve()));
        for (const file of selectedFiles) {
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

    const webStream = Readable.toWeb(archive) as unknown as ReadableStream<Uint8Array>;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${slug}-selected.zip"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
