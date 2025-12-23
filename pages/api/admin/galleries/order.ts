import fs from 'fs/promises';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const ORDER_PATH = path.join(process.cwd(), 'data/galleries-order.json');
const CATEGORIES = ['concerts', 'events', 'misc'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { category, order } = req.body;
  if (!CATEGORIES.includes(category) || !Array.isArray(order)) {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }
  let data;
  try {
    const file = await fs.readFile(ORDER_PATH, 'utf-8');
    data = JSON.parse(file);
  } catch {
    data = { concerts: [], events: [], misc: [] };
  }
  data[category] = order;
  await fs.writeFile(ORDER_PATH, JSON.stringify(data, null, 2));
  res.status(200).json({ success: true });
}
