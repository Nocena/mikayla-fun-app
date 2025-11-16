import { contextBridge, ipcRenderer } from 'electron';

// Read the absolute webview preload path passed by the main process via additionalArguments
const argPrefix = '--webview-preload=';
const preloadArg = (process.argv || []).find((a) => a.startsWith(argPrefix));
const webviewPreloadPath = preloadArg ? preloadArg.slice(argPrefix.length) : '';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  // Type helper: augment window type for TS in renderer via inline JSDoc
  /** @type {{ webviewPreload: string }} */
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
  // Session configuration for webview partitions
  session: {
    configureChromeLike: (partition: string, ua?: string) =>
        ipcRenderer.invoke('session:configureChromeLike', partition, ua),
  },
  // Paths helpful for renderer
  getWebviewPreloadPath: () => webviewPreloadPath,
  // Script results storage
  scripts: {
    append: (key: string, item: any) => ipcRenderer.invoke('scripts:append', key, item),
    get: (key: string) => ipcRenderer.invoke('scripts:get', key),
    clear: (key: string) => ipcRenderer.invoke('scripts:clear', key),
  },
});
