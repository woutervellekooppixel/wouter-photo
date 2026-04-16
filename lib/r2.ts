// Force Vercel to rebuild and use latest named exports
// Helpers voor gallery order opslaan/halen via R2
export async function getGalleryOrder(): Promise<Record<string, string[]>> {
  try {
    const buf = await getFile('galleries-order.json');
    const str = buf.toString('utf-8').trim();
    if (!str) return { concerts: [], events: [], misc: [] };
    const parsed = JSON.parse(str);
    if (
      typeof parsed !== 'object' ||
      !parsed ||
      !('concerts' in parsed) ||
      !('events' in parsed) ||
      !('misc' in parsed)
    ) {
      return { concerts: [], events: [], misc: [] };
    }
    return parsed;
  } catch (e) {
    return { concerts: [], events: [], misc: [] };
  }
}

export async function setGalleryOrder(data: Record<string, string[]>): Promise<void> {
  const buf = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
  await uploadFile(buf, 'galleries-order.json', 'application/json');
}
// --- ENVIRONMENT CHECK ---
const missingVars = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME'
].filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  throw new Error('R2 config error: ontbrekende env vars: ' + missingVars.join(', '));
}

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { sortFilesChronological } from "@/lib/utils";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface UploadMetadata {
  slug: string;
  title?: string;
  createdAt: string;
  files: {
    key: string;
    name: string;
    size: number;
    type: string;
    takenAt?: string;
  }[];
  gallery?: boolean;
}


export async function uploadFile(
  file: Buffer,
  key: string,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);
}

export async function getFile(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const response = await r2Client.send(command);
  const bytes = await response.Body?.transformToByteArray();
  return Buffer.from(bytes || []);
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}


export async function listFiles(prefix: string): Promise<string[]> {
  const allFiles: string[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const response = await r2Client.send(command);
    const files = response.Contents?.map((item) => item.Key!) || [];
    allFiles.push(...files);
    
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return allFiles;
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const response = await r2Client.send(command);
  
  if (response.$metadata.httpStatusCode !== 204 && response.$metadata.httpStatusCode !== 200) {
    throw new Error(`Failed to delete ${key}: HTTP ${response.$metadata.httpStatusCode}`);
  }
}

export async function saveMetadata(metadata: UploadMetadata): Promise<void> {
  const key = `metadata/${metadata.slug}.json`;
  await uploadFile(
    Buffer.from(JSON.stringify(metadata, null, 2)),
    key,
    "application/json"
  );
}

export async function getMetadata(slug: string): Promise<UploadMetadata | null> {
  try {
    const key = `metadata/${slug}.json`;
    const buffer = await getFile(key);
    return JSON.parse(buffer.toString("utf-8"));
  } catch (error) {
    return null;
  }
}

export async function listAllUploads(): Promise<UploadMetadata[]> {
  const metadataKeys = await listFiles("metadata/");
  const uploads: UploadMetadata[] = [];

  for (const key of metadataKeys) {
    if (key.endsWith(".json")) {
      const buffer = await getFile(key);
      const metadata = JSON.parse(buffer.toString("utf-8"));
      uploads.push(metadata);
    }
  }

  return uploads.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function deleteUpload(slug: string): Promise<void> {
  const metadata = await getMetadata(slug);
  if (!metadata) {
    throw new Error('Geen metadata gevonden voor ' + slug);
  }

  // Delete all files and their pre-generated thumbnails
  const sortedFiles = sortFilesChronological(metadata.files);
  for (const file of sortedFiles) {
    try {
      await deleteFile(file.key);
    } catch (err) {
      console.error('[deleteUpload] Fout bij verwijderen van', file.key, err);
      throw err;
    }
    try {
      await deleteFile(`thumbnails/${file.key}`);
    } catch {
      // thumbnail bestaat mogelijk niet, geen probleem
    }
  }

  // Delete pre-made zip if present
  try {
    await deleteFile(`zips/${slug}.zip`);
  } catch (err) {
    console.error('[deleteUpload] Fout bij verwijderen van zip', err);
  }

  // Best-effort: remove any remaining objects under uploads/<slug>/
  try {
    await deleteFolder(`uploads/${slug}/`);
  } catch (err) {
    // Don't fail the whole operation; we already removed the referenced objects.
    console.error('[deleteUpload] WARNING: deleteFolder uploads/<slug> failed', err);
  }

  // Delete metadata
  try {
    await deleteFile(`metadata/${slug}.json`);
  } catch (err) {
    console.error('[deleteUpload] Fout bij verwijderen van metadata', err);
    throw err;
  }
}

export async function deleteFolder(prefix: string): Promise<void> {
  const files = await listFiles(prefix);
  let keysToDelete = files;
  
  if (files.length === 0) {
    // Try without trailing slash
    const prefixWithoutSlash = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    const filesAlt = await listFiles(prefixWithoutSlash);
    
    if (filesAlt.length === 0) {
      return;
    }

    keysToDelete = filesAlt;
  }
  
  for (const key of keysToDelete) {
    await deleteFile(key);
  }
  
  // Verify deletion
  const remainingFiles = await listFiles(prefix);
  
  if (remainingFiles.length > 0) {
    console.error('[R2] WARNING: Some files were not deleted:', remainingFiles);
    throw new Error(`Failed to delete all files. ${remainingFiles.length} files remaining.`);
  }
}

