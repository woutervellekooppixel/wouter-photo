import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client } from "@aws-sdk/client-s3";

// Check if R2 is configured
const isR2Configured = Boolean(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

// Only initialize R2 if all env vars are present
let R2: S3Client | null = null;
if (isR2Configured) {
  R2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  if (!isR2Configured || !R2) {
    return NextResponse.json(
      { 
        error: "R2 storage not configured", 
        details: "Please configure R2 environment variables in .env.local. See .env.example for required variables."
      },
      { status: 503 }
    );
  }

  try {
    const { slug, fileName, fileType } = await request.json();

    if (!slug || !fileName) {
      return NextResponse.json(
        { error: "Slug and fileName are required" },
        { status: 400 }
      );
    }

    const key = `uploads/${slug}/${fileName}`;
    
    // Generate presigned URL for upload (valid for 1 hour)
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(R2, command, {
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({ presignedUrl, key });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate upload URL";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
