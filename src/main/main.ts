import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;

// Store cookies by origin
const cookieStore = new Map<string, { url: string; cookies: Record<string, string> }>();

const createWindow = (): void => {
  // Set app icon path - check for platform-specific icons first
  let iconPath: string | undefined;
  const assetsDir = join(__dirname, '../assets');
  
  if (process.platform === 'win32') {
    // Windows: prefer .ico, fallback to .png
    const icoPath = join(assetsDir, 'icon.ico');
    const pngPath = join(assetsDir, 'icon.png');
    iconPath = existsSync(icoPath) ? icoPath : (existsSync(pngPath) ? pngPath : undefined);
  } else if (process.platform === 'darwin') {
    // macOS: prefer .icns, fallback to .png
    const icnsPath = join(assetsDir, 'icon.icns');
    const pngPath = join(assetsDir, 'icon.png');
    iconPath = existsSync(icnsPath) ? icnsPath : (existsSync(pngPath) ? pngPath : undefined);
  } else {
    // Linux: use .png
    const pngPath = join(assetsDir, 'icon.png');
    iconPath = existsSync(pngPath) ? pngPath : undefined;
  }
  
  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true, // Enable webview tag
    },
  };

  // Only set icon if it exists
  if (iconPath) {
    windowOptions.icon = iconPath;
  }
  
  mainWindow = new BrowserWindow(windowOptions);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, 'renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// IPC handlers for cookie operations
ipcMain.handle('cookies:save', (_event, origin: string, url: string, cookies: Record<string, string>) => {
  try {
    cookieStore.set(origin, { url, cookies });
    console.log(`Cookies saved for origin: ${origin}`, cookies);
    return { success: true };
  } catch (error) {
    console.error('Error saving cookies:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('cookies:get', (_event, origin: string) => {
  try {
    const data = cookieStore.get(origin);
    return { success: true, data: data || null };
  } catch (error) {
    console.error('Error getting cookies:', error);
    return { success: false, error: String(error), data: null };
  }
});

ipcMain.handle('cookies:getAll', () => {
  try {
    const allData: Record<string, { url: string; cookies: Record<string, string> }> = {};
    cookieStore.forEach((value, key) => {
      allData[key] = value;
    });
    return { success: true, data: allData };
  } catch (error) {
    console.error('Error getting all cookies:', error);
    return { success: false, error: String(error), data: {} };
  }
});

ipcMain.handle('cookies:delete', (_event, origin: string) => {
  try {
    cookieStore.delete(origin);
    console.log(`Cookies deleted for origin: ${origin}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting cookies:', error);
    return { success: false, error: String(error) };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

