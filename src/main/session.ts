import { ipcMain, session } from 'electron';

export const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.161 Safari/537.36';

const configuredPartitions = new Set<string>();

export function configureChromeLikeHeadersForPartition(partition: string, uaOverride?: string) {
  if (!partition) return;
  if (configuredPartitions.has(partition)) return;
  const ses = session.fromPartition(partition);
  const ua = uaOverride || CHROME_UA;
  try {
    ses.setUserAgent(ua);
    ses.webRequest.onBeforeSendHeaders((details, callback) => {
      const headers = { ...details.requestHeaders };
      headers['User-Agent'] = ua;
      if (!headers['Accept-Language']) {
        headers['Accept-Language'] = 'en-US,en;q=0.9';
      }
      headers['sec-ch-ua'] = '"Google Chrome";v="121", "Chromium";v="121", "Not.A/Brand";v="99"';
      headers['sec-ch-ua-mobile'] = '?0';
      headers['sec-ch-ua-platform'] = '"Windows"';
      if (headers['sec-ch-ua-platform-version'] === undefined) {
        headers['sec-ch-ua-platform-version'] = '"10.0.0"';
      }
      if (headers['sec-ch-ua-arch'] === undefined) {
        headers['sec-ch-ua-arch'] = '"x86"';
      }
      if (headers['sec-ch-ua-bitness'] === undefined) {
        headers['sec-ch-ua-bitness'] = '"64"';
      }
      callback({ requestHeaders: headers });
    });
    configuredPartitions.add(partition);
  } catch (e) {
    // swallow
  }
}

export function configureDefaultPartitions() {
  configureChromeLikeHeadersForPartition('persist:default');
}

export function registerSessionIpcHandlers() {
  ipcMain.handle('session:configureChromeLike', (_event, partition: string, ua?: string) => {
    try {
      configureChromeLikeHeadersForPartition(partition, ua);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}


