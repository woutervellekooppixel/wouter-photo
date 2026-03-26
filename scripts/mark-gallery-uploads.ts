// scripts/mark-gallery-uploads.ts
// Markeer bestaande gallery-foto-uploads in R2 metadata als gallery: true (retroactief)

import { listFiles, getFile, saveMetadata } from '../lib/r2';

(async () => {
  const metadataKeys = await listFiles('metadata/');
  let changed = 0;
  for (const key of metadataKeys) {
    if (!key.endsWith('.json')) continue;
    const buffer = await getFile(key);
    const meta = JSON.parse(buffer.toString('utf-8'));
    // Gallery-foto's zijn uploads met precies 1 bestand, type image/webp, en key/id bevat 'concerts/', 'events/' of 'misc/'
    if (
      !meta.gallery &&
      Array.isArray(meta.files) &&
      meta.files.length === 1 &&
      meta.files[0].type === 'image/webp' &&
      /^(concerts|events|misc)\//.test(meta.files[0].key)
    ) {
      meta.gallery = true;
      await saveMetadata(meta);
      changed++;
      console.log('Marked as gallery:', key);
    }
  }
  console.log('Done. Marked', changed, 'uploads as gallery.');
})();
