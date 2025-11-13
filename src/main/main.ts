import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;

// Store localStorage data by origin
const localStorageStore = new Map<string, Record<string, string>>();

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

// IPC handlers for localStorage operations
ipcMain.handle('storage:save', (_event, origin: string, data: Record<string, string>) => {
  try {
    localStorageStore.set(origin, data);
    console.log(`Storage saved for origin: ${origin}`, data);
    return { success: true };
  } catch (error) {
    console.error('Error saving storage:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('storage:get', (_event, origin: string) => {
  try {
    const data = localStorageStore.get(origin) || {};
    return { success: true, data };
  } catch (error) {
    console.error('Error getting storage:', error);
    return { success: false, error: String(error), data: {} };
  }
});

ipcMain.handle('storage:getAll', () => {
  try {
    const allData: Record<string, Record<string, string>> = {};
    localStorageStore.forEach((value, key) => {
      allData[key] = value;
    });
    return { success: true, data: allData };
  } catch (error) {
    console.error('Error getting all storage:', error);
    return { success: false, error: String(error), data: {} };
  }
});

ipcMain.handle('storage:delete', (_event, origin: string) => {
  try {
    localStorageStore.delete(origin);
    console.log(`Storage deleted for origin: ${origin}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting storage:', error);
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

