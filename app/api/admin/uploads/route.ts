import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { listAllUploads } from "@/lib/r2";
import { getDownloadStats, kvStatsEnabled } from "@/lib/downloadStats";

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const uploads = await listAllUploads();
    // Filter gallery-foto's eruit
    const filtered = uploads.filter(u => !u.gallery);

    // KV-tellingen bovenop de (bevroren) metadata-baseline: sinds de
    // omschakeling tellen downloads atomair in KV; het metadata-JSON
    // wordt niet meer herschreven per download.
    if (kvStatsEnabled) {
      const stats = await getDownloadStats(filtered.map((u) => u.slug));
      for (const u of filtered) {
        const s = stats[u.slug];
        if (!s) continue;
        u.downloads = (u.downloads || 0) + s.downloads;
        u.downloadHistory = [
          ...(s.history as any),
          ...(u.downloadHistory || []),
        ].slice(0, 200);
      }
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error listing uploads:", error);
    return NextResponse.json(
      { error: "Failed to list uploads" },
      { status: 500 }
    );
  }
}
