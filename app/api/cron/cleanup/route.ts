import { NextRequest, NextResponse } from "next/server";
import { listFiles, getMetadata, saveMetadata, deleteUpload } from "@/lib/r2";
import { computeExpiresAtDate, computeExpiresAtIso } from "@/lib/expiry";

// This runs as a cron job (configured in vercel.json)
export async function GET(request: NextRequest) {
  // Allow Vercel Cron OR a shared secret for external schedulers.
  // Note: x-vercel-cron is not cryptographically secure; prefer CRON_SECRET where possible.
  const vercelCron = request.headers.get('x-vercel-cron');
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  const secretOk = secret && authHeader === `Bearer ${secret}`;
  const vercelOk = vercelCron === '1';
  if (!secretOk && !vercelOk) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const metadataFiles = await listFiles('metadata/');
    
    const deletedSlugs: string[] = [];
    const errors: string[] = [];

    for (const metadataFile of metadataFiles) {
      try {
        // Extract slug from metadata/slug.json
        const slug = metadataFile.replace('metadata/', '').replace('.json', '');
        const metadata = await getMetadata(slug);

        if (!metadata) {
          continue;
        }

        // Never auto-delete gallery background uploads
        if (metadata.gallery) {
          continue;
        }

        // Backfill expiresAt if missing (so admin can display it)
        if (!metadata.expiresAt) {
          const iso = computeExpiresAtIso(metadata);
          if (iso) {
            metadata.expiresAt = iso;
            await saveMetadata(metadata);
          }
        }

        const expiresAt = computeExpiresAtDate(metadata, now);
        if (!expiresAt) {
          continue;
        }

        if (now.getTime() > expiresAt.getTime()) {
          await deleteUpload(slug);
          deletedSlugs.push(slug);
        }
        
      } catch (error) {
        console.error(`[Cleanup] Error processing ${metadataFile}:`, error);
        errors.push(`${metadataFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      deleted: deletedSlugs,
      count: deletedSlugs.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[Cleanup] Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
