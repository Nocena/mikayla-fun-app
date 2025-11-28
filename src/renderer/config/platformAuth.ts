import type { CreatorPlatformKey } from '../utils/platform';

export interface PlatformAuthConfig {
  /** API endpoint to check authentication status */
  authCheckEndpoint: string;
  /** HTTP method for auth check */
  authCheckMethod: 'GET' | 'POST';
  /** Function to extract user ID from auth response */
  extractUserId: (data: any) => string | null;
  /** Function to extract username from auth response */
  extractUsername: (data: any) => string | null;
  /** Function to extract avatar URL from auth response */
  extractAvatar: (data: any) => string | null;
  /** Function to check if user is authenticated from response */
  isAuthenticated: (data: any) => boolean;
  /** Additional headers to include (besides captured headers) */
  additionalHeaders?: Record<string, string>;
}

type PlatformAuthConfigMap = Record<CreatorPlatformKey, PlatformAuthConfig>;

/**
 * Platform-specific authentication configurations
 * Each platform defines how to check auth status and extract user data
 */
export const PLATFORM_AUTH_CONFIG: PlatformAuthConfigMap = {
  onlyfans: {
    authCheckEndpoint: 'https://onlyfans.com/api2/v2/users/me',
    authCheckMethod: 'GET',
    extractUserId: (data) => (data?.id ? String(data.id) : null),
    extractUsername: (data) => data?.name || data?.username || null,
    extractAvatar: (data) => data?.avatar || null,
    isAuthenticated: (data) => data?.isAuth === true || data?.is_auth === true,
  },
  fansly: {
    authCheckEndpoint: 'https://apiv3.fansly.com/api/v1/account/me',
    authCheckMethod: 'GET',
    extractUserId: (data) => {
      // Fansly response structure: { success: true, response: { account: { id: "...", ... } } }
      const account = data?.response?.account;
      return account?.id ? String(account.id) : null;
    },
    extractUsername: (data) => {
      // Fansly response structure: { success: true, response: { account: { username: "...", ... } } }
      const account = data?.response?.account;
      return account?.username || account?.displayName || null;
    },
    extractAvatar: (data) => {
      // Fansly response structure: { success: true, response: { account: { avatar: { locations: [{ location: "..." }] } } } } }
      const account = data?.response?.account;
      if (!account) return null;
      
      // Fansly avatar is an object with locations array
      if (account.avatar?.locations && Array.isArray(account.avatar.locations) && account.avatar.locations.length > 0) {
        return account.avatar.locations[0].location || null;
      }
      
      // Fallback to simple string fields if avatar object structure is different
      return account?.avatarUrl || account?.profileImageUrl || null;
    },
    isAuthenticated: (data) => {
      // Fansly returns { success: true, response: { account: {...} } } when authenticated
      return data?.success === true && data?.response?.account != null;
    },
  },
  patreon: {
    authCheckEndpoint: 'https://www.patreon.com/api/current_user',
    authCheckMethod: 'GET',
    extractUserId: (data) => (data?.data?.id ? String(data.data.id) : null),
    extractUsername: (data) => data?.data?.attributes?.full_name || data?.data?.attributes?.vanity || null,
    extractAvatar: (data) => data?.data?.attributes?.image_url || null,
    isAuthenticated: (data) => !!data?.data?.id,
  },
  herohero: {
    authCheckEndpoint: 'https://herohero.co/api/v1/user/me',
    authCheckMethod: 'GET',
    extractUserId: (data) => (data?.id ? String(data.id) : null),
    extractUsername: (data) => data?.username || data?.name || null,
    extractAvatar: (data) => data?.avatar || data?.profilePicture || null,
    isAuthenticated: (data) => !!data?.id && !data?.error,
  },
};

/**
 * Get authentication configuration for a platform
 */
export const getPlatformAuthConfig = (platform: string): PlatformAuthConfig | null => {
  const normalized = platform.toLowerCase() as CreatorPlatformKey;
  return PLATFORM_AUTH_CONFIG[normalized] || null;
};

/**
 * Check if a platform has authentication support configured
 */
export const isPlatformAuthSupported = (platform: string): boolean => {
  return getPlatformAuthConfig(platform) !== null;
};

