import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export type NamedFileLike = { name?: string; key?: string };

export type ChronologicalFileLike = NamedFileLike & { takenAt?: string | Date | null };

export function sortFilesNatural<T extends NamedFileLike>(files: T[]): T[] {
  const collator = new Intl.Collator("nl-NL", {
    numeric: true,
    sensitivity: "base",
  });

  return [...files].sort((a, b) => {
    const aName = (a.name ?? a.key ?? "").toString();
    const bName = (b.name ?? b.key ?? "").toString();
    const primary = collator.compare(aName, bName);
    if (primary !== 0) return primary;
    const aKey = (a.key ?? "").toString();
    const bKey = (b.key ?? "").toString();
    return aKey.localeCompare(bKey);
  });
}

function toSortableTime(value: ChronologicalFileLike["takenAt"]): number | null {
  if (!value) return null;
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isFinite(t) ? t : null;
  }
  const t = Date.parse(value.toString());
  return Number.isFinite(t) ? t : null;
}

// Sort by EXIF/created date when available, else natural filename.
// Files with no `takenAt` are placed last.
export function sortFilesChronological<T extends ChronologicalFileLike>(files: T[]): T[] {
  const collator = new Intl.Collator("nl-NL", {
    numeric: true,
    sensitivity: "base",
  });

  return [...files].sort((a, b) => {
    const aTime = toSortableTime(a.takenAt);
    const bTime = toSortableTime(b.takenAt);

    if (aTime != null && bTime != null) {
      if (aTime !== bTime) return aTime - bTime;
    } else if (aTime != null) {
      return -1;
    } else if (bTime != null) {
      return 1;
    }

    const aName = (a.name ?? a.key ?? "").toString();
    const bName = (b.name ?? b.key ?? "").toString();
    const primary = collator.compare(aName, bName);
    if (primary !== 0) return primary;

    const aKey = (a.key ?? "").toString();
    const bKey = (b.key ?? "").toString();
    return aKey.localeCompare(bKey);
  });
}

// ── Seeded shuffle helpers ───────────────────────────────────────────────────
// Deterministic shuffle so every visitor sees the same order for a given seed
// (e.g. date + category). Server-side only: the server decides the order, which
// avoids any hydration mismatch on the client.

// FNV-1a string hash → 32-bit unsigned seed.
function hashSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 PRNG: fast, deterministic, good enough for shuffling.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle driven by a seeded PRNG. Returns a new array.
export function seededShuffle<T>(items: T[], seed: string): T[] {
  const rand = mulberry32(hashSeed(seed));
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Shuffle only the first `n` items (seeded), leaving the rest in place.
// Used to "rotate" the first few gallery photos daily while keeping the
// curated chronological order from item n onward.
export function seededShuffleFirstN<T>(items: T[], n: number, seed: string): T[] {
  if (items.length <= 1 || n <= 1) return items;
  const head = seededShuffle(items.slice(0, n), seed);
  return [...head, ...items.slice(n)];
}

// ── Shared file-type helpers ─────────────────────────────────────────────────
// Used by both the download gallery UI and the API download routes.

const FILTERED_FILES = [".ds_store", ".xmp", "thumbs.db", "desktop.ini"];

export function shouldFilterFile(filename: string): boolean {
  const name = filename.toLowerCase();
  return FILTERED_FILES.some((p) => name.includes(p)) || name.startsWith(".");
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic", "heif"];

export function isImageFile(filename: string): boolean {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  return IMAGE_EXTENSIONS.includes(ext);
}

export function isZipFile(filename: string, contentType?: string): boolean {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "zip") return true;
  if ((contentType ?? "").toLowerCase().includes("zip")) return true;
  return false;
}
