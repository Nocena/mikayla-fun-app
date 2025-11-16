import { BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createMainWindow(): BrowserWindow {
  let iconPath: string | undefined;
  const assetsDir = join(__dirname, '../../assets');

  if (process.platform === 'win32') {
    const icoPath = join(assetsDir, 'icon.ico');
    const pngPath = join(assetsDir, 'icon.png');
    iconPath = existsSync(icoPath) ? icoPath : (existsSync(pngPath) ? pngPath : undefined);
  } else if (process.platform === 'darwin') {
    const icnsPath = join(assetsDir, 'icon.icns');
    const pngPath = join(assetsDir, 'icon.png');
    iconPath = existsSync(icnsPath) ? icnsPath : (existsSync(pngPath) ? pngPath : undefined);
  } else {
    const pngPath = join(assetsDir, 'icon.png');
    iconPath = existsSync(pngPath) ? pngPath : undefined;
  }

  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
    },
  };

  if (iconPath) {
    windowOptions.icon = iconPath;
  }

  const win = new BrowserWindow(windowOptions);

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return win;
}


