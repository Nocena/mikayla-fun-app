import { ipcMain } from 'electron';
import { requestHeadersStore } from '../stores.js';

export function registerHeadersIpcHandlers() {
  ipcMain.handle('headers:get', (_event, partition: string) => {
    try {
      const data = requestHeadersStore.get(partition) || null;
      return { success: true, data };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  });

  ipcMain.handle('headers:getAll', () => {
    try {
      const all: Record<string, any> = {};
      requestHeadersStore.forEach((v: any, k: string) => {
        all[k] = v;
      });
      return { success: true, data: all };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  });

  ipcMain.handle('headers:delete', (_event, partition: string) => {
    try {
      requestHeadersStore.delete(partition);
      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  });
}


