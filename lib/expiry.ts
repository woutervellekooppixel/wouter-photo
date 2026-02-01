export const DEFAULT_DOWNLOAD_EXPIRY_DAYS = (() => {
  const raw = process.env.DEFAULT_DOWNLOAD_EXPIRY_DAYS;
  if (!raw) return 31;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 31;
})();

type Expirable = {
  createdAt?: string;
  expiresAt?: string;
};

export function computeExpiresAtDate(meta: Expirable, now: Date = new Date()): Date | null {
  if (meta.expiresAt) {
    const d = new Date(meta.expiresAt);
    return Number.isFinite(d.getTime()) ? d : null;
  }

  if (!meta.createdAt) return null;
  const created = new Date(meta.createdAt);
  if (!Number.isFinite(created.getTime())) return null;

  const expires = new Date(created.getTime());
  expires.setUTCDate(expires.getUTCDate() + DEFAULT_DOWNLOAD_EXPIRY_DAYS);

  // If clocks are weird and expiry ends up in the past for a brand-new upload,
  // still return the calculated value. Callers can decide what to do.
  void now;
  return expires;
}

export function computeExpiresAtIso(meta: Expirable): string | null {
  const d = computeExpiresAtDate(meta);
  return d ? d.toISOString() : null;
}

export function isExpired(meta: Expirable, now: Date = new Date()): boolean {
  const expires = computeExpiresAtDate(meta, now);
  if (!expires) return false;
  return now.getTime() > expires.getTime();
}
