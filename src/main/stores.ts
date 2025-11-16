// Centralized in-memory stores used by IPC handlers
export const cookieStore = new Map<string, { url: string; cookies: Record<string, string> }>();
export const localStorageStore = new Map<string, Record<string, string>>();


