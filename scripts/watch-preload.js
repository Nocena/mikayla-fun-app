import { watchFile, unwatchFile } from 'fs';
import { rename } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist');
const preloadJs = join(distDir, 'preload.js');
const preloadCjs = join(distDir, 'preload.cjs');

const renamePreload = async () => {
  try {
    await rename(preloadJs, preloadCjs);
    console.log('✓ Renamed preload.js to preload.cjs');
  } catch (error) {
    // Ignore errors (file might not exist or be locked)
    if (error.code !== 'ENOENT') {
      // Silently ignore other errors
    }
  }
};

// Start TypeScript compiler in watch mode
const tscProcess = spawn('tsc', ['-p', 'tsconfig.preload.json', '--watch'], {
  stdio: 'inherit',
  shell: true,
});

// Watch for preload.js file changes (watchFile works even if file doesn't exist)
watchFile(preloadJs, { interval: 500 }, async (curr, prev) => {
  // Check if file was created or modified
  if ((prev.size === 0 && curr.size > 0) || curr.mtime > prev.mtime) {
    // Small delay to ensure file is fully written
    setTimeout(renamePreload, 300);
  }
});

// Try to rename immediately in case file already exists
setTimeout(renamePreload, 2000);

// Cleanup on exit
const cleanup = () => {
  unwatchFile(preloadJs);
  tscProcess.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

