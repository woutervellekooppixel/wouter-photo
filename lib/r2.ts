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
import { Upload } from "@aws-sdk/lib-storage";
import archiver from "archiver";
import { sortFilesChronological } from "@/lib/utils";
import { PassThrough, Readable } from "stream";

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
  title?: string; // Optional: friendly title for the upload
  createdAt: string;
  expiresAt?: string; // Optioneel, niet meer verplicht
  files: {
    key: string;
    name: string;
    size: number;
    type: string;
    takenAt?: string; // Optional: EXIF capture time (ISO string)
  }[];
  downloads: number;
  downloadHistory?: {
    timestamp: string;
    type: 'all' | 'single' | 'selected' | 'folder';
    files?: string[]; // File keys that were downloaded
    ip?: string;
    userAgent?: string;
  }[];
  previewImageKey?: string; // Optional: key of the image to show on loading screen
  backgroundImageKey?: string; // Optional: key of the image to use as background
  ratings?: Record<string, boolean>; // Optional: client ratings for photos (fileKey -> rated)
  ratingsEnabled?: boolean; // Optional: allow clients to rate photos
  gallery?: boolean; // Optional: mark as gallery photo upload (not a real download)
}

export interface MonthlyStats {
  month: string; // Format: "2025-12"
  operations: {
    listFiles: number;
    getFile: number;
    putFile: number;
    deleteFile: number;
  };
  bandwidth: number; // bytes downloaded
  storage: number; // average bytes stored
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

export async function getFileStream(key: string): Promise<Readable> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const response = await r2Client.send(command);
  if (!response.Body) {
    throw new Error(`Empty body for key: ${key}`);
  }

  // In Node.js runtimes, AWS SDK v3 returns a Node readable stream here.
  return response.Body as unknown as Readable;
}

export async function getFileRange(key: string, range: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Range: range,
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

export async function getSignedDownloadUrlWithFilename(
  key: string,
  filename: string,
  expiresIn: number = 3600
): Promise<string> {
  const safeName = filename.replace(/"/g, "");
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${safeName}"`,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

export async function headObject(key: string): Promise<{ contentLength: number } | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    const response = await r2Client.send(command);
    const contentLength = response.ContentLength;
    if (typeof contentLength !== 'number') return null;
    return { contentLength };
  } catch {
    return null;
  }
}

export async function getZipSignedUrl(slug: string, expiresIn: number = 3600): Promise<string> {
  const zipKey = `zips/${slug}.zip`;
  return getSignedDownloadUrlWithFilename(zipKey, `${slug}.zip`, expiresIn);
}

export function getFolderZipKey(slug: string, folderPath: string): string {
  const safeFolderName = folderPath.replace(/[^a-zA-Z0-9-_]/g, "-");
  return `zips/${slug}/folders/${safeFolderName}.zip`;
}

export async function isZipObjectValid(zipKey: string): Promise<boolean> {
  // Basic validity check: confirm file exists and tail contains End Of Central Directory (EOCD) signature.
  const head = await headObject(zipKey);
  if (!head) return false;
  if (head.contentLength < 22) return false;

  const tailWindow = Math.min(65_536, head.contentLength);
  const start = Math.max(0, head.contentLength - tailWindow);
  const end = head.contentLength - 1;

  const tail = await getFileRange(zipKey, `bytes=${start}-${end}`);
  // EOCD signature: 0x50 0x4b 0x05 0x06
  const signature = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
  return tail.lastIndexOf(signature) !== -1;
}

export async function isZipFileValid(slug: string): Promise<boolean> {
  // Basic validity check: confirm file exists and tail contains End Of Central Directory (EOCD) signature.
  const zipKey = `zips/${slug}.zip`;
  const head = await headObject(zipKey);
  if (!head) return false;
  if (head.contentLength < 22) return false;

  const tailWindow = Math.min(65_536, head.contentLength);
  const start = Math.max(0, head.contentLength - tailWindow);
  const end = head.contentLength - 1;

  const tail = await getFileRange(zipKey, `bytes=${start}-${end}`);
  // EOCD signature: 0x50 0x4b 0x05 0x06
  const signature = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
  return tail.lastIndexOf(signature) !== -1;
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

// Streams a ZIP of the given files from R2 back into R2 under zipKey.
// Uses multipart upload (lib-storage) because the archive length is unknown up front.
async function createZipObject(
  zipKey: string,
  files: UploadMetadata["files"],
  entryName: (file: UploadMetadata["files"][number]) => string
): Promise<void> {
  const passThrough = new PassThrough();
  const upload = new Upload({
    client: r2Client,
    params: {
      Bucket: R2_BUCKET_NAME,
      Key: zipKey,
      Body: passThrough,
      ContentType: "application/zip",
    },
    queueSize: 2,
    partSize: 16 * 1024 * 1024,
  });
  const uploadPromise = upload.done();
  // Handler direct koppelen: als de multipart-upload faalt terwijl we nog
  // bestanden aan het archiveren zijn, zou de rejection anders unhandled
  // zijn en de hele functie crashen. De echte fout komt bij de await terug.
  uploadPromise.catch(() => {});

  // STORE (level 0): foto's/video's zijn al gecomprimeerd; scheelt veel CPU.
  const archive = archiver("zip", { zlib: { level: 0 }, store: true });
  archive.on("error", (err) => {
    passThrough.destroy(err);
  });
  archive.pipe(passThrough);

  // Eén bronbestand tegelijk: archiver verwerkt entries serieel, dus alle
  // streams vooraf openen betekent duizenden idle R2-connecties die op
  // idle-timeout klappen bij grote shoots.
  const entryDone = () =>
    new Promise<void>((resolve) => archive.once("entry", () => resolve()));

  const sortedFiles = sortFilesChronological(files);
  for (const file of sortedFiles) {
    const fileStream = await getFileStream(file.key);
    const done = entryDone();
    archive.append(fileStream, { name: entryName(file) });
    await done;
  }

  await archive.finalize();
  await uploadPromise;
}

// Boven deze totaalgrootte streamen we nooit on-the-fly een ZIP door een
// Vercel-functie: dat haalt de maxDuration niet en levert dan een stil
// afgekapte, kapotte ZIP op. In plaats daarvan wordt de kant-en-klare ZIP
// (async) gegenereerd en krijgt de klant een "wordt voorbereid"-status.
export const MAX_STREAMING_ZIP_BYTES = 1.5 * 1024 * 1024 * 1024;

// Simpele generatie-marker zodat niet elke bezoeker een dubbele
// zip-generatie aftrapt. Bewust best-effort: bij een race wint de laatste
// schrijver en dat is onschadelijk (zelfde inhoud).
export async function tryAcquireZipLock(slug: string): Promise<boolean> {
  const lockKey = `zips/${slug}.generating`;
  try {
    const head = await r2Client.send(
      new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: lockKey })
    );
    const age = Date.now() - (head.LastModified?.getTime() ?? 0);
    if (age < 10 * 60 * 1000) return false;
  } catch {
    // geen lock aanwezig
  }
  await uploadFile(Buffer.from(new Date().toISOString()), lockKey, "text/plain");
  return true;
}

export async function releaseZipLock(slug: string): Promise<void> {
  try {
    await deleteFile(`zips/${slug}.generating`);
  } catch {
    // best-effort
  }
}

export async function createZipFile(slug: string): Promise<void> {
  const metadata = await getMetadata(slug);
  if (!metadata) {
    throw new Error(`Metadata not found for ${slug}`);
  }

  await createZipObject(`zips/${slug}.zip`, metadata.files, (file) => file.name);
}

export async function createFolderZipFile(slug: string, folderPath: string): Promise<void> {
  const metadata = await getMetadata(slug);
  if (!metadata) {
    throw new Error(`Metadata not found for ${slug}`);
  }

  const folderFiles = metadata.files.filter((file) => {
    const fileFolderPath = file.name.includes("/")
      ? file.name.substring(0, file.name.lastIndexOf("/"))
      : "";
    return fileFolderPath === folderPath || fileFolderPath.startsWith(folderPath + "/");
  });

  if (folderFiles.length === 0) {
    throw new Error(`No files in folder ${folderPath} for ${slug}`);
  }

  await createZipObject(getFolderZipKey(slug, folderPath), folderFiles, (file) =>
    file.name.startsWith(folderPath + "/")
      ? file.name.slice(folderPath.length + 1)
      : (file.name.split("/").pop() || file.name)
  );
}

export async function getZipFile(slug: string): Promise<Buffer | null> {
  try {
    const zipKey = `zips/${slug}.zip`;
    return await getFile(zipKey);
  } catch (error) {
    return null;
  }
}

export async function updateDownloadCount(
  slug: string,
  type: 'all' | 'single' | 'selected' | 'folder' = 'all',
  files?: string[],
  ip?: string,
  userAgent?: string
): Promise<void> {
  const metadata = await getMetadata(slug);
  if (metadata) {
    metadata.downloads = (metadata.downloads || 0) + 1;
    
    // Add to download history
    if (!metadata.downloadHistory) {
      metadata.downloadHistory = [];
    }
    metadata.downloadHistory.push({
      timestamp: new Date().toISOString(),
      type,
      ...(files && { files }),
      ...(ip && { ip }),
      ...(userAgent && { userAgent }),
    });
    await saveMetadata(metadata);
  }
}

export async function listAllUploads(): Promise<UploadMetadata[]> {
  const metadataKeys = (await listFiles("metadata/")).filter((k) => k.endsWith(".json"));
  const uploads: UploadMetadata[] = [];

  // Parallel (met plafond) i.p.v. één-voor-één: bij 200 transfers scheelt
  // dat tientallen seconden dashboard-laadtijd. Eén corrupt JSON-bestand
  // mag bovendien niet het hele overzicht laten crashen.
  const CONCURRENCY = 10;
  let next = 0;
  const worker = async () => {
    while (true) {
      const i = next++;
      if (i >= metadataKeys.length) return;
      try {
        const buffer = await getFile(metadataKeys[i]);
        uploads.push(JSON.parse(buffer.toString("utf-8")));
      } catch (err) {
        console.error(`[listAllUploads] Overslaan van corrupt metadata-bestand ${metadataKeys[i]}:`, err);
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, metadataKeys.length) }, () => worker())
  );

  return uploads.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Max één download-notificatiemail per transfer per uur: klanten die een
// paar keer klikken (of 6 mappen apart downloaden) spammen de inbox anders vol.
export async function shouldSendDownloadNotification(
  slug: string,
  windowMs: number = 60 * 60 * 1000
): Promise<boolean> {
  const markerKey = `notifications/${slug}.last`;
  try {
    const head = await r2Client.send(
      new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: markerKey })
    );
    const age = Date.now() - (head.LastModified?.getTime() ?? 0);
    if (age < windowMs) return false;
  } catch {
    // geen marker: eerste notificatie
  }
  try {
    await uploadFile(Buffer.from(new Date().toISOString()), markerKey, "text/plain");
  } catch {
    // best-effort; liever een dubbele mail dan geen mail
  }
  return true;
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
    // Breedte-specifieke rendities (lightbox/hero — zie thumbnail-route)
    for (const w of [1920, 2560]) {
      try {
        await deleteFile(`thumbnails/w${w}/${file.key}`);
      } catch {
        // bestaat mogelijk niet, geen probleem
      }
    }
  }

  // Delete pre-made zip if present
  try {
    await deleteFile(`zips/${slug}.zip`);
  } catch (err) {
    console.error('[deleteUpload] Fout bij verwijderen van zip', err);
  }

  // Delete pre-made folder zips if present
  try {
    await deleteFolder(`zips/${slug}/`);
  } catch (err) {
    console.error('[deleteUpload] Fout bij verwijderen van folder-zips', err);
  }

  // Notificatie-marker en zip-lock opruimen (best-effort)
  for (const key of [`notifications/${slug}.last`, `zips/${slug}.generating`]) {
    try {
      await deleteFile(key);
    } catch {
      // bestaat mogelijk niet
    }
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
  // Alleen met trailing slash: een prefix zonder slash matcht óók
  // buurmap-objecten (zips/wedding → zips/wedding-teaser.zip) en zou
  // bestanden van een ándere transfer wissen.
  const safePrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
  const keysToDelete = await listFiles(safePrefix);

  if (keysToDelete.length === 0) {
    return;
  }

  for (const key of keysToDelete) {
    await deleteFile(key);
  }
  
  // Verify deletion
  const remainingFiles = await listFiles(safePrefix);

  if (remainingFiles.length > 0) {
    console.error('[R2] WARNING: Some files were not deleted:', remainingFiles);
    throw new Error(`Failed to delete all files. ${remainingFiles.length} files remaining.`);
  }
}

export async function findOrphanedUploads(): Promise<string[]> {
  // Get all upload folders
  const allFiles = await listFiles("uploads/");
  const uploadFolders = new Set<string>();
  
  for (const key of allFiles) {
    const parts = key.split('/');
    if (parts.length >= 2) {
      uploadFolders.add(parts[1]); // slug is the second part after "uploads/"
    }
  }

  // Get all metadata slugs
  const metadataKeys = await listFiles("metadata/");
  const metadataSlugs = new Set<string>();
  
  for (const key of metadataKeys) {
    if (key.endsWith(".json")) {
      const slug = key.replace("metadata/", "").replace(".json", "");
      metadataSlugs.add(slug);
    }
  }

  // Find folders without metadata
  const orphaned: string[] = [];
  for (const folder of uploadFolders) {
    if (!metadataSlugs.has(folder)) {
      orphaned.push(folder);
    }
  }

  return orphaned;
}

// Monthly stats tracking
export async function getMonthlyStats(): Promise<MonthlyStats> {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  try {
    const key = `stats/${currentMonth}.json`;
    const buffer = await getFile(key);
    return JSON.parse(buffer.toString('utf-8'));
  } catch (error) {
    // Return default stats if not found
    return {
      month: currentMonth,
      operations: {
        listFiles: 0,
        getFile: 0,
        putFile: 0,
        deleteFile: 0,
      },
      bandwidth: 0,
      storage: 0,
    };
  }
}

export async function saveMonthlyStats(stats: MonthlyStats): Promise<void> {
  const key = `stats/${stats.month}.json`;
  await uploadFile(
    Buffer.from(JSON.stringify(stats, null, 2)),
    key,
    'application/json'
  );
}

export async function trackOperation(operation: keyof MonthlyStats['operations'], count: number = 1): Promise<void> {
  const stats = await getMonthlyStats();
  stats.operations[operation] += count;
  await saveMonthlyStats(stats);
}

export async function trackBandwidth(bytes: number): Promise<void> {
  const stats = await getMonthlyStats();
  stats.bandwidth += bytes;
  await saveMonthlyStats(stats);
}

export async function calculateMonthlyCost(): Promise<{
  storage: number;
  operations: number;
  bandwidth: number;
  total: number;
}> {
  const stats = await getMonthlyStats();
  const uploads = await listAllUploads();
  
  // Calculate current storage
  const totalStorage = uploads.reduce((acc, u) => 
    acc + u.files.reduce((sum, f) => sum + f.size, 0), 0
  );
  
  // R2 Pricing (per maand)
  const storageGB = totalStorage / (1024 * 1024 * 1024);
  const storageCost = storageGB * 0.015; // $0.015 per GB/month
  
  // Operations cost
  const classAOps = stats.operations.listFiles + stats.operations.putFile + stats.operations.deleteFile;
  const classBOps = stats.operations.getFile;
  const operationsCost = (classAOps / 1000000) * 4.50 + (classBOps / 1000000) * 0.36;
  
  // Bandwidth cost (egress is free for first 10TB/month with R2!)
  const bandwidthCost = 0;
  
  return {
    storage: storageGB,
    operations: operationsCost,
    bandwidth: bandwidthCost,
    total: storageCost + operationsCost + bandwidthCost,
  };
}
