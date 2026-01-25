import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getPortfolioGalleryData } from '@/lib/portfolioGallery';


export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  const result = await getPortfolioGalleryData();
  const res = NextResponse.json(result);
  // Admin endpoint: must reflect uploads/deletes immediately
  res.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  return res;
}

// CORS headers helper
function withCORS(res: Response) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  // Admin endpoint responses should never be cached
  res.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  return res;
}

export async function DELETE(req: NextRequest) {
  let debug: any = {};
  let slug = '';
  let metadata = null;
  let id = '';
  try {
    const body = await req.json();
    id = body.id;
    const category = body.category;
    if (!category || !id) {
      return withCORS(NextResponse.json({ error: "category and id required" }, { status: 400 }));
    }
    slug = id.replace(/\.[^.]+$/, '');
    let deleted = false;
    let triedFallback = false;
    try {
      const { getMetadata, deleteUpload, deleteFile, listFiles } = await import("@/lib/r2");
      metadata = await getMetadata(slug);
      debug = { slug, metadata };
      if (metadata) {
        await deleteUpload(slug);
        deleted = true;
      } else {
        // Fallback: probeer direct bestand(en) te verwijderen op basis van naam/categorie
        triedFallback = true;
        // Zoek bestand in R2 (in uploads/ of photos/ of direct via naam)
        // Probeer uploads/{category}/{id} en uploads/{category}/{slug}.webp
        const candidates = [
          `uploads/${category}/${id}`,
          `uploads/${category}/${slug}.webp`,
          `uploads/${category}/${slug}-blur.jpg`,
          `photos/${category}/${id}`,
          `photos/${category}/${slug}.webp`,
          `photos/${category}/${slug}-blur.jpg`,
          `${category}/${id}`,
          `${category}/${slug}.webp`,
          `${category}/${slug}-blur.jpg`
        ];
        let found = false;
        for (const key of candidates) {
          try {
            // Check of bestand bestaat
            const files = await listFiles(key);
            if (files && files.length > 0) {
              for (const f of files) {
                await deleteFile(f);
                found = true;
              }
            }
          } catch {}
        }
        if (found) deleted = true;
      }
    } catch (err) {
      debug.fallbackError = String(err);
    }

    // Verwijder uit galleries-order.json
    const fs = await import('fs/promises');
    const path = await import('path');
    const ORDER_PATH = path.join(process.cwd(), 'data/galleries-order.json');
    try {
      const file = await fs.readFile(ORDER_PATH, 'utf-8');
      const orderData = JSON.parse(file);
      for (const cat of Object.keys(orderData)) {
        const before = orderData[cat].length;
        orderData[cat] = orderData[cat].filter((fname: string) => fname !== id);
        const after = orderData[cat].length;
        if (before !== after) {
        }
      }
      await fs.writeFile(ORDER_PATH, JSON.stringify(orderData, null, 2), 'utf-8');
    } catch (e) {
      console.error('Kon galleries-order.json niet bijwerken:', e);
    }
    if (deleted) {
      return withCORS(NextResponse.json({ success: true, fallback: triedFallback }));
    } else {
      return withCORS(NextResponse.json({ error: 'Delete failed (geen metadata en geen fysiek bestand gevonden)', debug: { slug, id, category, triedFallback, metadata, ...debug } }, { status: 404 }));
    }
  } catch (e: any) {
    let errorString = 'Delete failed';
    if (e instanceof Error && e.message) {
      errorString = e.message;
    } else if (typeof e === 'string') {
      errorString = e;
    } else if (typeof e === 'object') {
      try {
        errorString = JSON.stringify(e);
      } catch {
        errorString = String(e);
      }
    }
    console.error('[delete] Fout bij verwijderen:', errorString, debug, e);
    return withCORS(NextResponse.json({ error: errorString, debug: { forced: true, test: 123, debug, errorString } }, { status: 500 }));
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return withCORS(new Response(null, { status: 204 }));
}
