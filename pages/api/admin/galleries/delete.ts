import fs from 'fs/promises';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const CATEGORIES = ['concerts', 'events', 'misc'];
const PUBLIC_DIR = process.cwd() + '/public/photos/';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { category, id } = req.body;
  if (!CATEGORIES.includes(category) || typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid category or id' });
    return;
  }
  try {
    // Zoek bestand in map
    const dir = path.join(PUBLIC_DIR, category);
    const files = await fs.readdir(dir);
    const file = files.find(f => f.startsWith(id));
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    // Verwijder hoofdafbeelding
    await fs.unlink(path.join(dir, file));
    // Verwijder blur (indien aanwezig)
    const blurFile = file.replace(/\.webp$/, '-blur.jpg');
    try { await fs.unlink(path.join(dir, blurFile)); } catch {}
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Delete failed' });
  }
}
