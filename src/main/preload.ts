import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  // Cookie management methods
  cookies: {
    save: (origin: string, url: string, cookies: Record<string, string>) =>
      ipcRenderer.invoke('cookies:save', origin, url, cookies),
    get: (origin: string) => ipcRenderer.invoke('cookies:get', origin),
    getAll: () => ipcRenderer.invoke('cookies:getAll'),
    delete: (origin: string) => ipcRenderer.invoke('cookies:delete', origin),
  },
  // LocalStorage management methods
  storage: {
    save: (origin: string, data: Record<string, string>) =>
      ipcRenderer.invoke('storage:save', origin, data),
    get: (origin: string) => ipcRenderer.invoke('storage:get', origin),
    getAll: () => ipcRenderer.invoke('storage:getAll'),
    delete: (origin: string) => ipcRenderer.invoke('storage:delete', origin),
  },
});

