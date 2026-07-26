import { NextRequest, NextResponse } from "next/server";
import { listFiles, getMetadata, saveMetadata, deleteUpload } from "@/lib/r2";
import { computeExpiresAtDate, computeExpiresAtIso } from "@/lib/expiry";

// This runs as a cron job (configured in vercel.json)
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  // Alleen met CRON_SECRET: Vercel Cron stuurt zelf "Authorization: Bearer
  // <CRON_SECRET>" mee zodra die env var bestaat. De x-vercel-cron header is
  // door iedereen te zetten en is dus géén geldige auth.
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const metadataFiles = await listFiles('metadata/');

    const deletedSlugs: string[] = [];
    const backfilledSlugs: string[] = [];
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

        // Backfill voor oude uploads zonder expiresAt (en evt. createdAt):
        // geef minimaal 7 dagen respijt vanaf nu en verwijder ze NIET in
        // dezelfde run — anders wist de eerste cron-run in één klap alle
        // legacy transfers.
        if (!metadata.expiresAt) {
          if (!metadata.createdAt) {
            metadata.createdAt = now.toISOString();
          }
          const computed = computeExpiresAtIso(metadata);
          const grace = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();
          metadata.expiresAt = computed && computed > grace ? computed : grace;
          await saveMetadata(metadata);
          backfilledSlugs.push(slug);
          continue;
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
      backfilled: backfilledSlugs.length > 0 ? backfilledSlugs : undefined,
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
