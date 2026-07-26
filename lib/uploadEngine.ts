// Client-side upload-engine voor het admin-dashboard.
//
// Wat dit oplost t.o.v. de oude sequentiële loop:
// - 4 bestanden parallel i.p.v. één voor één (veel sneller op snelle lijnen)
// - één mislukt bestand stopt de batch niet meer; fouten worden per bestand
//   verzameld en zijn daarna gericht opnieuw te proberen
// - automatische retry (1x) bij netwerk-/serverfouten
// - bestanden boven SINGLE_PUT_MAX gaan via multipart (parts van 64MB) —
//   daarmee vervalt de oude 2GB-muur voor concertvideo's
// - echte foutmeldingen: de R2-/serverfout wordt doorgegeven i.p.v. het
//   generieke "Upload failed"

import { SINGLE_PUT_MAX_BYTES } from "@/lib/validation";

export type UploadedFileMeta = {
  key: string;
  name: string;
  size: number;
  type: string;
  takenAt?: string;
};

export type FailedFile = { name: string; error: string; file: File };

export type BatchProgress = {
  uploadedBytes: number;
  totalBytes: number;
  doneCount: number;
  failedCount: number;
  totalCount: number;
};

const PART_SIZE = 64 * 1024 * 1024;
const FILE_CONCURRENCY = 4;
const PART_CONCURRENCY = 3;

function extractR2Error(xhr: XMLHttpRequest): string {
  const text = xhr.responseText || "";
  const match = text.match(/<Message>([^<]*)<\/Message>/i);
  const detail = match ? match[1] : text.slice(0, 200);
  return `HTTP ${xhr.status}${detail ? ` — ${detail}` : ""}`;
}

async function readServerError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  return (data && (data.error || data.message)) || `${fallback} (HTTP ${res.status})`;
}

function putWithProgress(
  url: string,
  body: Blob,
  contentType: string | undefined,
  onLoaded: (loadedBytes: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onLoaded(e.loaded);
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onLoaded(body.size);
        resolve();
      } else {
        reject(new Error(extractR2Error(xhr)));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Netwerkfout tijdens upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload afgebroken")));
    xhr.open("PUT", url);
    if (contentType) xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(body);
  });
}

async function uploadSingle(
  slug: string,
  file: File,
  onLoaded: (loadedBytes: number) => void
): Promise<string> {
  const presignedRes = await fetch("/api/admin/presigned-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }),
  });
  if (!presignedRes.ok) {
    throw new Error(await readServerError(presignedRes, "Upload-URL aanvragen mislukt"));
  }
  const { presignedUrl, key } = await presignedRes.json();
  await putWithProgress(presignedUrl, file, file.type || "application/octet-stream", onLoaded);
  return key;
}

async function multipartAction<T = any>(payload: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/admin/multipart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readServerError(res, "Multipart-aanvraag mislukt"));
  }
  return res.json();
}

async function uploadMultipart(
  slug: string,
  file: File,
  onLoaded: (loadedBytes: number) => void
): Promise<string> {
  const { key, uploadId } = await multipartAction<{ key: string; uploadId: string }>({
    action: "create",
    slug,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });

  const partCount = Math.ceil(file.size / PART_SIZE);
  const partLoaded = new Array<number>(partCount).fill(0);
  const reportTotal = () => onLoaded(partLoaded.reduce((a, b) => a + b, 0));

  try {
    let nextPart = 0;
    const worker = async () => {
      while (true) {
        const partIndex = nextPart++;
        if (partIndex >= partCount) return;
        const start = partIndex * PART_SIZE;
        const blob = file.slice(start, Math.min(start + PART_SIZE, file.size));
        const partNumber = partIndex + 1;

        const attempt = async () => {
          const { url } = await multipartAction<{ url: string }>({
            action: "sign-part",
            key,
            uploadId,
            partNumber,
          });
          await putWithProgress(url, blob, undefined, (loaded) => {
            partLoaded[partIndex] = loaded;
            reportTotal();
          });
        };
        try {
          await attempt();
        } catch {
          // één retry per part
          partLoaded[partIndex] = 0;
          reportTotal();
          await attempt();
        }
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(PART_CONCURRENCY, partCount) }, () => worker())
    );

    await multipartAction({ action: "complete", key, uploadId });
    return key;
  } catch (err) {
    // Ruim de parts op zodat er geen onzichtbare opslagkosten blijven hangen.
    multipartAction({ action: "abort", key, uploadId }).catch(() => {});
    throw err;
  }
}

export async function uploadFilesToR2(opts: {
  slug: string;
  files: File[];
  getTakenAt?: (file: File) => Promise<string | undefined>;
  onProgress?: (p: BatchProgress) => void;
  onFileUploaded?: (meta: UploadedFileMeta) => void;
}): Promise<{ uploaded: UploadedFileMeta[]; failed: FailedFile[] }> {
  const { slug, files, getTakenAt, onProgress, onFileUploaded } = opts;

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  const loadedPerFile = new Map<File, number>();
  const uploaded: UploadedFileMeta[] = [];
  const failed: FailedFile[] = [];

  const report = () => {
    if (!onProgress) return;
    let sum = 0;
    for (const v of loadedPerFile.values()) sum += v;
    onProgress({
      uploadedBytes: sum,
      totalBytes,
      doneCount: uploaded.length,
      failedCount: failed.length,
      totalCount: files.length,
    });
  };

  let nextIndex = 0;
  const worker = async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= files.length) return;
      const file = files[index];

      const doUpload = async (): Promise<string> => {
        const onLoaded = (loaded: number) => {
          loadedPerFile.set(file, Math.min(loaded, file.size));
          report();
        };
        if (file.size > SINGLE_PUT_MAX_BYTES) {
          return uploadMultipart(slug, file, onLoaded);
        }
        return uploadSingle(slug, file, onLoaded);
      };

      try {
        const takenAt = getTakenAt ? await getTakenAt(file).catch(() => undefined) : undefined;
        let key: string;
        try {
          key = await doUpload();
        } catch {
          // één automatische retry voor het hele bestand
          loadedPerFile.set(file, 0);
          report();
          key = await doUpload();
        }
        const meta: UploadedFileMeta = {
          key,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          ...(takenAt ? { takenAt } : {}),
        };
        uploaded.push(meta);
        onFileUploaded?.(meta);
      } catch (err) {
        loadedPerFile.set(file, 0);
        failed.push({
          name: file.name,
          error: err instanceof Error ? err.message : "Onbekende fout",
          file,
        });
      }
      report();
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(FILE_CONCURRENCY, files.length) }, () => worker())
  );
  report();

  return { uploaded, failed };
}
