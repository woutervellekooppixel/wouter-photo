import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/r2";
import { isValidSlug, SINGLE_PUT_MAX_BYTES } from "@/lib/validation";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { slug, fileName, fileType, fileSize } = await request.json();

    if (!slug || !fileName) {
      return NextResponse.json(
        { error: "Slug and fileName are required" },
        { status: 400 }
      );
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: "Invalid slug" },
        { status: 400 }
      );
    }

    if (typeof fileSize !== "number" || fileSize <= 0 || fileSize > SINGLE_PUT_MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large for single upload — use multipart" },
        { status: 413 }
      );
    }

    // Verleng de admin-sessie tijdens lange upload-batches.
    try {
      const session = await getSession();
      if (session.isLoggedIn) await session.save();
    } catch {
      // best-effort
    }

    // Zelfde naamregels als de append-route: geen traversal of rare keys.
    if (
      typeof fileName !== "string" ||
      fileName.length > 1024 ||
      fileName.includes("..") ||
      fileName.includes("\\") ||
      fileName.startsWith("/")
    ) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const key = `uploads/${slug}/${fileName}`;
    
    // Generate presigned URL for upload (valid for 1 hour)
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({ presignedUrl, key });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
