import { ipcMain } from 'electron';
import { scriptResultsStore } from '../stores.js';

export function registerScriptsIpcHandlers() {
  ipcMain.handle('scripts:append', (_event, key: string, item: any) => {
    try {
      const arr = scriptResultsStore.get(key) ?? [];
      arr.push(item);
      scriptResultsStore.set(key, arr);
      return { success: true, length: arr.length };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('scripts:get', (_event, key: string) => {
    try {
      const arr = scriptResultsStore.get(key) ?? [];
      return { success: true, data: arr };
    } catch (error) {
      return { success: false, error: String(error), data: [] };
    }
  });

  ipcMain.handle('scripts:clear', (_event, key: string) => {
    try {
      scriptResultsStore.delete(key);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}


