// Centralized in-memory stores used by IPC handlers
export const cookieStore = new Map<string, { url: string; cookies: Record<string, string> }>();
export const localStorageStore = new Map<string, Record<string, string>>();
// Stores results of executed scripts keyed by a logical key (e.g., partition/account)
export const scriptResultsStore = new Map<string, any[]>();
// Stores last seen request headers per partition (or per partition:endpoint if you choose)
export const requestHeadersStore = new Map<string, Record<string, any>>();


