import { ipcMain, session } from 'electron';
import { requestHeadersStore } from './stores.js';

export const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.161 Safari/537.36';

const configuredPartitions = new Set<string>();

/**
 * Platform configuration for request header interception
 */
export interface PlatformConfig {
  /** Platform identifier (e.g., 'onlyfans', 'fansly') */
  id: string;
  /** URL pattern to intercept (supports wildcards) */
  endpointPattern: string;
}

/**
 * Supported platform configurations
 */
export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  fansly: {
    id: 'fansly',
    endpointPattern: 'https://apiv3.fansly.com/api/v1/account/me*',
  },
  onlyfans: {
    id: 'onlyfans',
    endpointPattern: 'https://onlyfans.com/api2/v2/users/me*',
  },
};

const escapeRegex = (pattern: string) =>
  pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const wildcardPatternToRegex = (pattern: string) => {
  const escaped = escapeRegex(pattern).replace(/\\\*/g, '.*');
  return new RegExp(`^${escaped}$`);
};

/**
 * Registers a single request header interception handler for all configured platforms
 */
function registerPlatformInterceptors(
  ses: Electron.Session,
  partition: string,
  platforms: PlatformConfig[]
) {
  if (!platforms.length) return;
  const platformMatchers = platforms.map((platform) => ({
    platform,
    matcher: wildcardPatternToRegex(platform.endpointPattern),
  }));
  const urls = platforms.map((platform) => platform.endpointPattern);

  ses.webRequest.onBeforeSendHeaders({ urls }, (details, callback) => {
    const matched = platformMatchers.find(({ matcher }) => matcher.test(details.url));
    if (matched) {
      const storageKey = `${partition}:${matched.platform.id}`;
      try {
        requestHeadersStore.set(storageKey, { ...details.requestHeaders });
      } catch {
        // Ignore storage errors
      }
    }
    callback({ requestHeaders: details.requestHeaders });
  });
}

/**
 * Configures Chrome-like headers and platform interceptors for a partition
 */
export function configureChromeLikeHeadersForPartition(
  partition: string,
  uaOverride?: string,
  platforms?: PlatformConfig[]
) {
  if (!partition) return;
  if (configuredPartitions.has(partition)) return;
  
  const ses = session.fromPartition(partition);
  const ua = uaOverride || CHROME_UA;
  
  try {
    ses.setUserAgent(ua);
    
    // Configure Chrome-like headers for all requests
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
    
    // Register interceptors for specified platforms (defaults to all platforms)
    const platformsToRegister = platforms || Object.values(PLATFORM_CONFIGS);
    registerPlatformInterceptors(ses, partition, platformsToRegister);
    
    configuredPartitions.add(partition);
  } catch (e) {
    // Ignore configuration errors
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
