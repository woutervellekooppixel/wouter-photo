import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export interface UploadMetadata {
  slug: string;
  title?: string;
  createdAt: string;
  expiresAt: string;
  files: {
    key: string;
    name: string;
    size: number;
    type: string;
  }[];
  downloads: number;
  downloadHistory?: {
    timestamp: string;
    type: 'all' | 'selected';
    fileKeys?: string[];
    ip: string;
    userAgent: string;
  }[];
  previewImageKey?: string;
  ratings?: Record<string, number>; // fileKey -> rating (1-5)
}

// Upload file to R2
export async function uploadFile(buffer: Buffer, key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await R2.send(command);
}

// Download file from R2
export async function downloadFile(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await R2.send(command);
  
  if (!response.Body) {
    throw new Error("Empty response body");
  }

  // Convert stream to buffer
  const stream = response.Body as Readable;
  const chunks: Uint8Array[] = [];
  
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}

// Delete file from R2
export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await R2.send(command);
}

// Delete folder (all files with prefix)
export async function deleteFolder(prefix: string) {
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  });

  const listResponse = await R2.send(listCommand);
  
  if (!listResponse.Contents || listResponse.Contents.length === 0) {
    return;
  }

  // Delete all files
  for (const object of listResponse.Contents) {
    if (object.Key) {
      await deleteFile(object.Key);
    }
  }
}

// List files in a folder
export async function listFiles(prefix: string) {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  });

  const response = await R2.send(command);
  return response.Contents || [];
}

// Save metadata
export async function saveMetadata(metadata: UploadMetadata) {
  const key = `metadata/${metadata.slug}.json`;
  const buffer = Buffer.from(JSON.stringify(metadata, null, 2));
  
  await uploadFile(buffer, key, "application/json");
}

// Get metadata
export async function getMetadata(slug: string): Promise<UploadMetadata | null> {
  try {
    const key = `metadata/${slug}.json`;
    const buffer = await downloadFile(key);
    return JSON.parse(buffer.toString());
  } catch (error) {
    return null;
  }
}

// Delete metadata
export async function deleteMetadata(slug: string) {
  const key = `metadata/${slug}.json`;
  await deleteFile(key);
}

// List all uploads
export async function listAllUploads(): Promise<UploadMetadata[]> {
  const files = await listFiles("metadata/");
  const uploads: UploadMetadata[] = [];

  for (const file of files) {
    if (file.Key && file.Key.endsWith(".json")) {
      const slug = file.Key.replace("metadata/", "").replace(".json", "");
      const metadata = await getMetadata(slug);
      if (metadata) {
        uploads.push(metadata);
      }
    }
  }

  return uploads.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Update download count
export async function updateDownloadCount(
  slug: string, 
  type: 'all' | 'selected',
  fileKeys?: string[],
  ip?: string,
  userAgent?: string
) {
  const metadata = await getMetadata(slug);
  if (!metadata) return;

  metadata.downloads = (metadata.downloads || 0) + 1;
  
  // Add to download history
  if (!metadata.downloadHistory) {
    metadata.downloadHistory = [];
  }
  
  metadata.downloadHistory.push({
    timestamp: new Date().toISOString(),
    type,
    fileKeys,
    ip: ip || 'unknown',
    userAgent: userAgent || 'unknown'
  });

  await saveMetadata(metadata);
}

// Find orphaned uploads (folders without metadata)
export async function findOrphanedUploads(): Promise<string[]> {
  const allFiles = await listFiles("uploads/");
  const metadata = await listFiles("metadata/");
  
  const metadataSlugs = new Set(
    metadata
      .filter(f => f.Key?.endsWith(".json"))
      .map(f => f.Key!.replace("metadata/", "").replace(".json", ""))
  );

  const uploadFolders = new Set<string>();
  for (const file of allFiles) {
    if (file.Key) {
      const parts = file.Key.split("/");
      if (parts.length >= 2 && parts[0] === "uploads") {
        uploadFolders.add(parts[1]);
      }
    }
  }

  return Array.from(uploadFolders).filter(slug => !metadataSlugs.has(slug));
}

// Check if file exists
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await R2.send(command);
    return true;
  } catch {
    return false;
  }
}

// Delete entire upload (files and metadata)
export async function deleteUpload(slug: string) {
  // Delete all files
  await deleteFolder(`uploads/${slug}/`);
  // Delete metadata
  await deleteMetadata(slug);
}

