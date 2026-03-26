import { NextRequest, NextResponse } from "next/server";
import { r2Client } from "@/lib/r2";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const params = await context.params;
    const filename = params.filename;
    
    // List files in backgrounds folder to find the exact file
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME!,
      Prefix: "backgrounds/",
    });
    
    const listResponse = await r2Client.send(listCommand);
    const contents = listResponse.Contents ?? [];

    // If the default background has been uploaded multiple times with different
    // extensions (default-background.jpg/png/webp/...), prefer the newest one.
    const defaultPrefix = `backgrounds/${filename}.`;
    const candidates = filename === "default-background"
      ? contents.filter(obj => (obj.Key ?? "").startsWith(defaultPrefix))
      : contents.filter(obj => (obj.Key ?? "").includes(filename));

    const backgroundFile = candidates
      .slice()
      .sort((a, b) => {
        const aTime = a.LastModified ? new Date(a.LastModified).getTime() : 0;
        const bTime = b.LastModified ? new Date(b.LastModified).getTime() : 0;
        return bTime - aTime;
      })[0];
    
    if (!backgroundFile?.Key) {
      return new NextResponse("Background not found", { status: 404 });
    }

    // Get the file from R2
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: backgroundFile.Key,
    });

    const response = await r2Client.send(command);
    const imageBuffer = await response.Body?.transformToByteArray();

    if (!imageBuffer) {
      return new NextResponse("Failed to load background", { status: 500 });
    }

    // Convert to Buffer for NextResponse
    const buffer = Buffer.from(imageBuffer);

    // Determine content type from file extension
    const ext = backgroundFile.Key.split('.').pop()?.toLowerCase();
    const contentType = 
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
      ext === 'png' ? 'image/png' :
      ext === 'webp' ? 'image/webp' :
      ext === 'svg' ? 'image/svg+xml' :
      'image/jpeg';

    // Default background can be changed via the admin panel, so avoid immutable caching.
    const cacheControl = filename === "default-background"
      ? "public, max-age=0, must-revalidate"
      : "public, max-age=31536000, immutable";

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
    };

    if (backgroundFile.LastModified) {
      headers["Last-Modified"] = new Date(backgroundFile.LastModified).toUTCString();
    }

    if (response.ETag) {
      headers["ETag"] = response.ETag;
    }

    return new NextResponse(buffer, {
      headers,
    });
  } catch (error) {
    console.error("Error loading background:", error);
    return new NextResponse("Failed to load background", { status: 500 });
  }
}
