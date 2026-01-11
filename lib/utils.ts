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
