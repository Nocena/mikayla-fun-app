import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './windows/createMainWindow.js';
import { configureDefaultPartitions, registerSessionIpcHandlers } from './session.js';
import { registerCookieIpcHandlers } from './ipc/cookies.js';
import { registerStorageIpcHandlers } from './ipc/storage.js';
import { registerScriptsIpcHandlers } from './ipc/scripts.js';

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(() => {
  // Configure default network/session behavior
  configureDefaultPartitions();
  registerSessionIpcHandlers();
  registerCookieIpcHandlers();
  registerStorageIpcHandlers();
  registerScriptsIpcHandlers();

  mainWindow = createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

