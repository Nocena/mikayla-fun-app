export interface ElectronAPI {
  platform: string;
  cookies: {
    save: (origin: string, url: string, cookies: Record<string, string>) => Promise<{ success: boolean; error?: string }>;
    get: (origin: string) => Promise<{ success: boolean; data: { url: string; cookies: Record<string, string> } | null; error?: string }>;
    getAll: () => Promise<{ success: boolean; data: Record<string, { url: string; cookies: Record<string, string> }>; error?: string }>;
    delete: (origin: string) => Promise<{ success: boolean; error?: string }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

