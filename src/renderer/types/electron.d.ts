export interface ElectronAPI {
  platform: string;
  storage: {
    save: (origin: string, data: Record<string, string>) => Promise<{ success: boolean; error?: string }>;
    get: (origin: string) => Promise<{ success: boolean; data: Record<string, string>; error?: string }>;
    getAll: () => Promise<{ success: boolean; data: Record<string, Record<string, string>>; error?: string }>;
    delete: (origin: string) => Promise<{ success: boolean; error?: string }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

