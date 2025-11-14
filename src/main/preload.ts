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
});

