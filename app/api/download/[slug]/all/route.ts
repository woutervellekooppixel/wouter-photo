import { NextRequest, NextResponse } from "next/server";
import { getMetadata, downloadFile, updateDownloadCount } from "@/lib/r2";
import archiver from "archiver";

export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const metadata = await getMetadata(slug);

    if (!metadata) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check expiry
    const now = new Date();
    const expiresAt = new Date(metadata.expiresAt);
    if (now > expiresAt) {
      return NextResponse.json({ error: "Expired" }, { status: 410 });
    }

    // Update download count
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await updateDownloadCount(slug, 'all', undefined, ip, userAgent);

    // Create zip archive with streaming
    const archive = archiver("zip", { zlib: { level: 6 } });
    
    const stream = new ReadableStream({
      start(controller) {
        archive.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        archive.on("end", () => {
          controller.close();
        });

        archive.on("error", (err) => {
          controller.error(err);
        });

        // Start adding files to the archive
        (async () => {
          try {
            for (const file of metadata.files) {
              const buffer = await downloadFile(file.key);
              archive.append(buffer, { name: file.name });
            }
            await archive.finalize();
          } catch (error) {
            archive.destroy();
            controller.error(error);
          }
        })();
      },
    });

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
