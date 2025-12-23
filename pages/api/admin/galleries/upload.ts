import formidable, { Fields, Files } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const CATEGORIES = ['concerts', 'events', 'misc'];
const PUBLIC_DIR = process.cwd() + '/public/photos/';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const form = formidable({ multiples: false });
  // Maak van form.parse een Promise
  const parseForm = () => new Promise<{fields: Fields, files: Files}>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
  try {
    const { fields, files } = await parseForm();
    // Debug: log ontvangen fields en files
    // eslint-disable-next-line no-console
    console.log('UPLOAD DEBUG fields:', fields);
    // eslint-disable-next-line no-console
    console.log('UPLOAD DEBUG files:', files);
    let category: any = fields.category;
    if (Array.isArray(category)) category = category[0];
    if (typeof category !== 'string' || !CATEGORIES.includes(category)) {
      res.status(400).json({ error: 'Invalid category' });
      return;
    }
    let file = files.file as formidable.File | formidable.File[] | undefined;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    if (Array.isArray(file)) file = file[0];
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const data = await fs.readFile(file.filepath);
    let origName = file.originalFilename?.replace(/\s+/g, '_') || 'upload';
    let base = origName.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const webpName = base + '.webp';
    const dest = path.join(PUBLIC_DIR, category, webpName);
    // Converteer altijd naar webp
    await sharp(data).toFormat('webp').toFile(dest);
    // Genereer blur-versie van webp
    const blurDest = dest.replace('.webp', '-blur.jpg');
    await sharp(dest).resize(32).jpeg({ quality: 40 }).toFile(blurDest);
    // Verwijder tijdelijk uploadbestand (formidable doet dit meestal zelf, maar voor de zekerheid)
    try { await fs.unlink(file.filepath); } catch {}
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Upload error' });
  }
}
