import { ipcMain } from 'electron';
import fetch from 'node-fetch';
import { requestHeadersStore } from '../stores.js';

/**
 * Gets request headers for a specific platform and partition
 */
function getPlatformHeaders(partition: string) {
  return requestHeadersStore.get(partition);
}

export function registerFanslyIpcHandlers() {
  // Poll Fansly /api/v1/account/me with the latest headers captured for the given partition
  ipcMain.handle('fansly:getMe', async (_event, partition: string) => {
    try {
      const headers = getPlatformHeaders(partition);
      if (!headers) {
        return { success: false, error: 'No headers for partition yet' };
      }
      const res = await fetch('https://apiv3.fansly.com/api/v1/account/me', {
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

