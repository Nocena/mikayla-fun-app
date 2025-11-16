import { ipcMain } from 'electron';
import { cookieStore } from '../stores';

export function registerCookieIpcHandlers() {
  ipcMain.handle('cookies:save', (_event, origin: string, url: string, cookies: Record<string, string>) => {
    try {
      cookieStore.set(origin, { url, cookies });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('cookies:get', (_event, origin: string) => {
    try {
      const data = cookieStore.get(origin);
      return { success: true, data: data || null };
    } catch (error) {
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
      return { success: false, error: String(error), data: {} };
    }
  });

  ipcMain.handle('cookies:delete', (_event, origin: string) => {
    try {
      cookieStore.delete(origin);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}


