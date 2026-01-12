
import { NextResponse } from 'next/server';
import { listFiles, getGalleryOrder } from '@/lib/r2';

import { NextRequest } from 'next/server';


import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2Client } from '@/lib/r2';

const EXCLUDED_ROOT_PREFIXES = new Set([
  'backgrounds',
  'metadata',
  'uploads',
  'zips',
]);

// Dynamisch alle categorieën ophalen (alle mappen op rootniveau)
async function getCategories(): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME!,
    Delimiter: '/',
    Prefix: '',
  });
  const response = await r2Client.send(command);
  // CommonPrefixes bevat alle mappen
  return (response.CommonPrefixes || [])
    .map((p) => p.Prefix?.replace(/\/$/, ''))
    .filter(Boolean)
    .filter((prefix) => !EXCLUDED_ROOT_PREFIXES.has(prefix as string)) as string[];
}


export async function GET(request: Request) {
  let orderData: Record<string, string[]> = await getGalleryOrder();
  const result: Record<string, { id: string, src: string, alt: string, category: string }[]> = {};
  const categories = await getCategories();
  for (const cat of categories) {
    let files: string[] = [];
    try {
      files = (await listFiles(`${cat}/`)).map(f => f.split('/').pop()!).filter(Boolean);
    } catch (e) {
      result[cat] = [];
      continue;
    }
    // Filter blur-bestanden en alleen .webp of .jpg/.jpeg
    let allPhotos = files.filter(f => (f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.jpeg')) && !f.includes('-blur')).map(f => ({
      id: f,
      src: `/api/photos/by-key?key=${encodeURIComponent(cat + '/' + f)}`,
      alt: f,
      category: cat,
      key: cat + '/' + f
    }));
    // Sorteer exact volgens orderData, ontbrekende foto's achteraan
    let photos: typeof allPhotos = [];
    if (orderData[cat] && orderData[cat].length > 0) {
      // Eerst alles uit orderData in die volgorde
      photos = orderData[cat]
        .map(fname => allPhotos.find(p => p.id === fname))
        .filter(Boolean) as typeof allPhotos;
      // Voeg ontbrekende foto's toe (nieuwe uploads etc)
      const orderedSet = new Set(orderData[cat]);
      const missing = allPhotos.filter(p => !orderedSet.has(p.id));
      photos = [...photos, ...missing];
    } else {
      photos = allPhotos;
    }
    result[cat] = photos;
  }
  return NextResponse.json(result);
}

// CORS headers helper
function withCORS(res: Response) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return res;
}

export async function DELETE(req: NextRequest) {
  console.log('DELETE handler start');
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
          console.log(`[delete] ${id} verwijderd uit galleries-order.json categorie ${cat}`);
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
