import { ipcMain } from 'electron';
import { localStorageStore } from '../stores';

export function registerStorageIpcHandlers() {
  ipcMain.handle('storage:save', (_event, origin: string, data: Record<string, string>) => {
    try {
      localStorageStore.set(origin, data);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle('storage:get', (_event, origin: string) => {
    try {
      const data = localStorageStore.get(origin) || {};
      return { success: true, data };
    } catch (error) {
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
      return { success: false, error: String(error), data: {} };
    }
  });

  ipcMain.handle('storage:delete', (_event, origin: string) => {
    try {
      localStorageStore.delete(origin);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}


