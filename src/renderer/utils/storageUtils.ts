/**
 * Utility functions to interact with cookies stored in the main process
 */

/**
 * Get cookies data for a specific origin
 * @param origin - The origin (e.g., 'https://example.com')
 * @returns Promise resolving to the cookies data with url
 */
export const getCookiesForOrigin = async (origin: string): Promise<{ url: string; cookies: Record<string, string> } | null> => {
  try {
    const result = await window.electronAPI.cookies.get(origin);
    if (result.success) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Error getting cookies for origin:', error);
    return null;
  }
};

/**
 * Get all stored cookies data
 * @returns Promise resolving to all stored cookies data keyed by origin
 */
export const getAllCookies = async (): Promise<Record<string, { url: string; cookies: Record<string, string> }>> => {
  try {
    const result = await window.electronAPI.cookies.getAll();
    if (result.success) {
      return result.data;
    }
    return {};
  } catch (error) {
    console.error('Error getting all cookies:', error);
    return {};
  }
};

/**
 * Delete cookies data for a specific origin
 * @param origin - The origin to delete cookies for
 * @returns Promise resolving to success status
 */
export const deleteCookiesForOrigin = async (origin: string): Promise<boolean> => {
  try {
    const result = await window.electronAPI.cookies.delete(origin);
    return result.success;
  } catch (error) {
    console.error('Error deleting cookies for origin:', error);
    return false;
  }
};

/**
 * Get a specific cookie value for an origin
 * @param origin - The origin
 * @param cookieName - The cookie name
 * @returns Promise resolving to the value or null
 */
export const getCookieValue = async (
  origin: string,
  cookieName: string
): Promise<string | null> => {
  const cookiesData = await getCookiesForOrigin(origin);
  if (cookiesData && cookiesData.cookies) {
    return cookiesData.cookies[cookieName] || null;
  }
  return null;
};

