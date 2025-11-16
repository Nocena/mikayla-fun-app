import { ipcMain } from 'electron';
import fetch from 'node-fetch';
import { requestHeadersStore } from '../stores.js';

export function registerOnlyfansIpcHandlers() {
  // Poll OnlyFans /api2/v2/users/me with the latest headers captured for the given partition
  ipcMain.handle('of:getMe', async (_event, partition: string) => {
    try {
      const headers = requestHeadersStore.get(partition);
      if (!headers) {
        return { success: false, error: 'No headers for partition yet' };
      }
      const res = await fetch('https://onlyfans.com/api2/v2/users/me', {
        method: 'GET',
        headers: {
          // Pass through captured request headers (includes cookies, UA, CH, etc.)
          ...(headers as Record<string, string>),
        },
      });
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
      return { success: res.ok, status: res.status, data };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  });
}


