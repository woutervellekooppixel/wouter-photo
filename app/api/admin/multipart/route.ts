import { NextRequest, NextResponse } from "next/server";
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/r2";
import { requireAdminAuth, getSession } from "@/lib/auth";
import { isValidSlug, MAX_UPLOAD_FILE_SIZE_BYTES } from "@/lib/validation";

const BUCKET = process.env.R2_BUCKET_NAME!;

function isSafeFileName(name: unknown): name is string {
  if (typeof name !== "string") return false;
  if (!name || name.length > 1024) return false;
  if (name.includes("..") || name.includes("\\") || name.startsWith("/")) return false;
  return true;
}

// Multipart uploads voor grote bestanden (concertvideo's!): de browser PUT
// elke part rechtstreeks naar R2 via een presigned URL. De browser hoeft
// géén ETag-headers te kunnen lezen (CORS ExposeHeaders): bij "complete"
// haalt de server de parts zelf op met ListParts.
export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  // Verleng de admin-sessie: uploads van tientallen GB duren uren en de
  // sessie mag niet halverwege verlopen.
  try {
    const session = await getSession();
    if (session.isLoggedIn) await session.save();
  } catch {
    // best-effort
  }

  try {
    const body = await request.json();
    const action = body?.action;

    if (action === "create") {
      const { slug, fileName, fileType, fileSize } = body;
      if (!isValidSlug(slug)) {
        return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
      }
      if (!isSafeFileName(fileName)) {
        return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
      }
      if (typeof fileSize !== "number" || fileSize <= 0 || fileSize > MAX_UPLOAD_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: "File size exceeds allowed limit" }, { status: 413 });
      }
      const key = `uploads/${slug}/${fileName}`;
      const created = await r2Client.send(
        new CreateMultipartUploadCommand({
          Bucket: BUCKET,
          Key: key,
          ContentType: typeof fileType === "string" && fileType ? fileType : "application/octet-stream",
        })
      );
      return NextResponse.json({ key, uploadId: created.UploadId });
    }

    if (action === "sign-part") {
      const { key, uploadId, partNumber } = body;
      if (typeof key !== "string" || !key.startsWith("uploads/") || key.includes("..")) {
        return NextResponse.json({ error: "Invalid key" }, { status: 400 });
      }
      if (typeof uploadId !== "string" || !uploadId) {
        return NextResponse.json({ error: "Invalid uploadId" }, { status: 400 });
      }
      if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000) {
        return NextResponse.json({ error: "Invalid partNumber" }, { status: 400 });
      }
      const url = await getSignedUrl(
        r2Client,
        new UploadPartCommand({
          Bucket: BUCKET,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
        }),
        { expiresIn: 3600 }
      );
      return NextResponse.json({ url });
    }

    if (action === "complete") {
      const { key, uploadId } = body;
      if (typeof key !== "string" || !key.startsWith("uploads/") || key.includes("..")) {
        return NextResponse.json({ error: "Invalid key" }, { status: 400 });
      }
      if (typeof uploadId !== "string" || !uploadId) {
        return NextResponse.json({ error: "Invalid uploadId" }, { status: 400 });
      }
      // Server haalt de part-ETags zelf op — geen CORS ExposeHeaders nodig.
      const parts: { PartNumber: number; ETag: string }[] = [];
      let partNumberMarker: string | undefined;
      do {
        const listed = await r2Client.send(
          new ListPartsCommand({
            Bucket: BUCKET,
            Key: key,
            UploadId: uploadId,
            PartNumberMarker: partNumberMarker,
          })
        );
        for (const p of listed.Parts ?? []) {
          if (p.PartNumber && p.ETag) parts.push({ PartNumber: p.PartNumber, ETag: p.ETag });
        }
        partNumberMarker = listed.IsTruncated ? listed.NextPartNumberMarker : undefined;
      } while (partNumberMarker);

      if (parts.length === 0) {
        return NextResponse.json({ error: "No uploaded parts found" }, { status: 400 });
      }
      parts.sort((a, b) => a.PartNumber - b.PartNumber);

      await r2Client.send(
        new CompleteMultipartUploadCommand({
          Bucket: BUCKET,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts },
        })
      );
      return NextResponse.json({ success: true, key });
    }

    if (action === "abort") {
      const { key, uploadId } = body;
      if (typeof key !== "string" || !key.startsWith("uploads/") || key.includes("..")) {
        return NextResponse.json({ error: "Invalid key" }, { status: 400 });
      }
      if (typeof uploadId !== "string" || !uploadId) {
        return NextResponse.json({ error: "Invalid uploadId" }, { status: 400 });
      }
      await r2Client.send(
        new AbortMultipartUploadCommand({ Bucket: BUCKET, Key: key, UploadId: uploadId })
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Multipart error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Multipart request failed" },
      { status: 500 }
    );
  }
}
