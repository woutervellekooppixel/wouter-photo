// Downloadtellingen en -historie in Vercel KV (Upstash Redis).
//
// Waarom: de oude aanpak herschreef bij elke download het metadata-JSON in
// R2 (read-modify-write). Twee gelijktijdige downloads overschreven elkaar
// dan — tellingen misten klikken en historie-regels verdwenen. KV-increments
// zijn atomair en het metadata-bestand groeit niet meer mee.
//
// Zonder KV_REST_API_URL (niet geconfigureerd) vallen alle functies stil
// terug op "niet gedaan" en gebruikt de aanroeper het oude R2-pad.

import { kv } from "@vercel/kv";

export const kvStatsEnabled = Boolean(process.env.KV_REST_API_URL);

export type DownloadEvent = {
  timestamp: string;
  type: "all" | "single" | "selected" | "folder";
  files?: string[];
  ip?: string;
  userAgent?: string;
};

const HISTORY_MAX = 200;

const countKey = (slug: string) => `dl:count:${slug}`;
const histKey = (slug: string) => `dl:hist:${slug}`;

export async function recordDownload(
  slug: string,
  type: DownloadEvent["type"],
  files?: string[],
  ip?: string,
  userAgent?: string
): Promise<boolean> {
  if (!kvStatsEnabled) return false;
  try {
    const event: DownloadEvent = {
      timestamp: new Date().toISOString(),
      type,
      ...(files && files.length > 0 ? { files: files.slice(0, 50) } : {}),
      ...(ip ? { ip } : {}),
      ...(userAgent ? { userAgent } : {}),
    };
    await Promise.all([
      kv.incr(countKey(slug)),
      kv
        .lpush(histKey(slug), JSON.stringify(event))
        .then(() => kv.ltrim(histKey(slug), 0, HISTORY_MAX - 1)),
    ]);
    return true;
  } catch (err) {
    console.error("[downloadStats] KV record failed, falling back to R2:", err);
    return false;
  }
}

export async function getDownloadStats(
  slugs: string[]
): Promise<Record<string, { downloads: number; history: DownloadEvent[] }>> {
  if (!kvStatsEnabled || slugs.length === 0) return {};
  try {
    const counts = await kv.mget<(number | null)[]>(
      ...slugs.map((s) => countKey(s))
    );
    const out: Record<string, { downloads: number; history: DownloadEvent[] }> = {};

    // Histories met beperkte parallelliteit ophalen
    let next = 0;
    const worker = async () => {
      while (true) {
        const i = next++;
        if (i >= slugs.length) return;
        const slug = slugs[i];
        const count = Number(counts[i] ?? 0);
        let history: DownloadEvent[] = [];
        if (count > 0) {
          try {
            const raw = await kv.lrange<string[]>(histKey(slug), 0, HISTORY_MAX - 1);
            history = (raw as unknown as (string | DownloadEvent)[])
              .map((r) => {
                try {
                  return typeof r === "string" ? (JSON.parse(r) as DownloadEvent) : r;
                } catch {
                  return null;
                }
              })
              .filter((e): e is DownloadEvent => Boolean(e));
          } catch {
            // historie is nice-to-have
          }
        }
        if (count > 0 || history.length > 0) {
          out[slug] = { downloads: count, history };
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(8, slugs.length) }, () => worker()));
    return out;
  } catch (err) {
    console.error("[downloadStats] KV read failed:", err);
    return {};
  }
}

export async function deleteDownloadStats(slug: string): Promise<void> {
  if (!kvStatsEnabled) return;
  try {
    await kv.del(countKey(slug), histKey(slug));
  } catch {
    // best-effort
  }
}
