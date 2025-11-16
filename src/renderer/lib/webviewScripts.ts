export type ScriptSpec = { id: string; code: string };

export async function runAndStoreScripts(
  webviewHandle: { executeScripts: (scripts: ScriptSpec[]) => Promise<Array<{ id: string; result?: any; error?: string }>> },
  scripts: ScriptSpec[]
) {
  const results = await webviewHandle.executeScripts(scripts);
  return results;
}

export async function getStoredScriptResults(key: string) {
  const res = await window.electronAPI.scripts.get(key);
  if (res.success) return res.data;
  throw new Error(res.error || 'Unknown error');
}

export async function clearStoredScriptResults(key: string) {
  const res = await window.electronAPI.scripts.clear(key);
  if (!res.success) throw new Error(res.error || 'Unknown error');
}


