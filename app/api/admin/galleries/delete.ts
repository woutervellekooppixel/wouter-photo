
import { NextRequest, NextResponse } from "next/server";
import { deleteFile } from "@/lib/r2";

// CORS headers helper
function withCORS(res: Response) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return res;
}

export const runtime = "nodejs";

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
    try {
      const { getMetadata } = await import("@/lib/r2");
      metadata = await getMetadata(slug);
    } catch {}
    debug = { slug, metadata };
    // Verwijder alle varianten en metadata via deleteUpload
    const { deleteUpload } = await import("@/lib/r2");
    await deleteUpload(slug);

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
    return withCORS(NextResponse.json({ success: true }));
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
