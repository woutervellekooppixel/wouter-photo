import 'dotenv/config';
import { listFiles } from '../lib/r2';

(async () => {
  try {
    const files = await listFiles('metadata/');
    console.log('Metadata-bestanden in R2:', files);
  } catch (e) {
    console.error('Fout bij ophalen metadata-bestanden:', e);
    process.exit(1);
  }
})();
