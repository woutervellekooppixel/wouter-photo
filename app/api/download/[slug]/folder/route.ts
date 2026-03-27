import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import archiver from "archiver";
import { getMetadata, getFileStream, updateDownloadCount } from "@/lib/r2";
import { downloadRateLimit } from "@/lib/rateLimit";
import { isValidSlug } from "@/lib/validation";
import { isExpired } from "@/lib/expiry";
import { sortFilesChronological } from "@/lib/utils";
import { sendDownloadNotification } from "@/lib/email";

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
        return fileFolderPath === folderPath;
      })
    );

    if (folderFiles.length === 0) {
      return NextResponse.json({ error: "No files found in this folder" }, { status: 404 });
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    await updateDownloadCount(slug, "selected", folderFiles.map((f) => f.key), ip, userAgent);
    sendDownloadNotification(slug, folderFiles.length).catch(console.error);

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.on("warning", (err) => console.warn("[FolderDownload] ZIP warning:", err));

    (async () => {
      try {
        for (const file of folderFiles) {
          const fileName = file.name.split("/").pop() || file.name;
          const fileStream = await getFileStream(file.key);
          archive.append(fileStream, { name: fileName });
        }
        await archive.finalize();
      } catch (error) {
        archive.destroy();
      }
    })();

    const safeFolderName = folderPath.replace(/[^a-zA-Z0-9-_]/g, "-");
    const webStream = Readable.toWeb(archive) as unknown as ReadableStream<Uint8Array>;

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeFolderName}.zip"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error creating folder ZIP:", error);
    return NextResponse.json({ error: "Failed to create folder download" }, { status: 500 });
  }
}
