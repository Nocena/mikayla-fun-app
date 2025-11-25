/**
 * Filter out forbidden headers for browser fetch
 * Removes headers that browsers don't allow to be set manually
 */
export const filterAllowedHeaders = (rawHeaders: Record<string, any>): Record<string, string> => {
  const allowedHeaders: Record<string, string> = {};
  const forbiddenPattern = /^(cookie|host|origin|referer|connection|content-length|sec-|proxy-)/i;

  Object.entries(rawHeaders).forEach(([key, value]) => {
    const headerKey = String(key);
    if (!forbiddenPattern.test(headerKey)) {
      allowedHeaders[headerKey] = String(value);
    }
  });

  return allowedHeaders;
};

/**
 * Generate fetch script for authentication check
 */
export const generateAuthCheckScript = (
  endpoint: string,
  method: 'GET' | 'POST',
  headers: Record<string, string>
): string => {
  return `
    (async () => {
      try {
        const headers = ${JSON.stringify(headers)};
        const res = await fetch('${endpoint}', {
          method: '${method}',
          credentials: 'include',
          headers
        });
        const text = await res.text();
        let data = null;
        try { 
          data = JSON.parse(text); 
        } catch { 
          data = { raw: text }; 
        }
        return { ok: res.ok, status: res.status, data };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    })();
  `;
};

/**
 * Extract user data from authentication response
 */
export interface ExtractedUserData {
  userId: string | null;
  username: string | null;
  avatar: string | null;
}

export const extractUserData = (
  authData: any,
  config: {
    extractUserId: (data: any) => string | null;
    extractUsername: (data: any) => string | null;
    extractAvatar: (data: any) => string | null;
  }
): ExtractedUserData => {
  return {
    userId: config.extractUserId(authData),
    username: config.extractUsername(authData),
    avatar: config.extractAvatar(authData),
  };
};

