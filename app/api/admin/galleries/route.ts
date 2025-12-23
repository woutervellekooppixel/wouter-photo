import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const CATEGORIES = ['concerts', 'events', 'misc']
const PUBLIC_DIR = process.cwd() + '/public/photos/'
const ORDER_PATH = path.join(process.cwd(), 'data/galleries-order.json')

export async function GET(request: Request) {
  let orderData: Record<string, string[]> = { concerts: [], events: [], misc: [] };
  try {
    const file = await fs.readFile(ORDER_PATH, 'utf-8');
    orderData = JSON.parse(file);
  } catch {}
  const result: Record<string, { id: string, src: string, alt: string, category: string }[]> = {};
  for (const cat of CATEGORIES) {
    const dir = path.join(PUBLIC_DIR, cat);
    let files: string[] = [];
    try {
      files = await fs.readdir(dir);
    } catch (e) {
      result[cat] = [];
      continue;
    }
    // Filter blur-bestanden en alleen .webp
    let photos = files.filter(f => f.endsWith('.webp') && !f.includes('-blur')).map(f => ({
      id: f,
      src: `/photos/${cat}/${f}`,
      alt: f,
      category: cat
    }));
    // Sorteer volgens orderData als beschikbaar
    if (orderData[cat] && orderData[cat].length > 0) {
      photos = orderData[cat]
        .map(fname => photos.find(p => p.id === fname))
        .filter(Boolean) as typeof photos;
      // Voeg niet-geordende foto's toe aan het eind
      const orderedIds = new Set(orderData[cat]);
      photos = photos.concat(
        files
          .filter(f => f.endsWith('.webp') && !f.includes('-blur') && !orderedIds.has(f))
          .map(f => ({
            id: f,
            src: `/photos/${cat}/${f}`,
            alt: f,
            category: cat
          }))
      );
    }
    result[cat] = photos;
  }
  return NextResponse.json(result);
}
