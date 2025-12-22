import { NextRequest, NextResponse } from "next/server";
import { getMetadata, downloadFile, updateDownloadCount } from "@/lib/r2";
import archiver from "archiver";

export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { fileKeys } = await request.json();

    if (!fileKeys || !Array.isArray(fileKeys) || fileKeys.length === 0) {
      return NextResponse.json({ error: "File keys required" }, { status: 400 });
    }

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

    const selectedFiles = metadata.files.filter(f => fileKeys.includes(f.key));

    if (selectedFiles.length === 0) {
      return NextResponse.json({ error: "No valid files found" }, { status: 404 });
    }

    // Track download
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await updateDownloadCount(slug, 'selected', fileKeys, ip, userAgent);

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

        (async () => {
          try {
            for (const file of selectedFiles) {
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
        "Content-Disposition": `attachment; filename="${slug}-selected.zip"`,
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
