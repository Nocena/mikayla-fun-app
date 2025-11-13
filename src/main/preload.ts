import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  // LocalStorage management methods
  storage: {
    save: (origin: string, data: Record<string, string>) =>
      ipcRenderer.invoke('storage:save', origin, data),
    get: (origin: string) => ipcRenderer.invoke('storage:get', origin),
    getAll: () => ipcRenderer.invoke('storage:getAll'),
    delete: (origin: string) => ipcRenderer.invoke('storage:delete', origin),
  },
});

