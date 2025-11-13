import { rename } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist');
const preloadJs = join(distDir, 'preload.js');
const preloadCjs = join(distDir, 'preload.cjs');

try {
  await rename(preloadJs, preloadCjs);
  console.log('✓ Renamed preload.js to preload.cjs');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.warn('⚠ preload.js not found, skipping rename');
  } else {
    console.error('✗ Error renaming preload.js:', error.message);
    process.exit(1);
  }
}

