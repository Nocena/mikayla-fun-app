/**
 * Utility functions to interact with localStorage stored in the main process
 */

/**
 * Get localStorage data for a specific origin
 * @param origin - The origin (e.g., 'https://example.com')
 * @returns Promise resolving to the localStorage data
 */
export const getStorageForOrigin = async (origin: string): Promise<Record<string, string>> => {
  try {
    const result = await window.electronAPI.storage.get(origin);
    if (result.success) {
      return result.data;
    }
    return {};
  } catch (error) {
    console.error('Error getting storage for origin:', error);
    return {};
  }
};

/**
 * Get all stored localStorage data
 * @returns Promise resolving to all stored localStorage data keyed by origin
 */
export const getAllStorage = async (): Promise<Record<string, Record<string, string>>> => {
  try {
    const result = await window.electronAPI.storage.getAll();
    if (result.success) {
      return result.data;
    }
    return {};
  } catch (error) {
    console.error('Error getting all storage:', error);
    return {};
  }
};

/**
 * Delete localStorage data for a specific origin
 * @param origin - The origin to delete storage for
 * @returns Promise resolving to success status
 */
export const deleteStorageForOrigin = async (origin: string): Promise<boolean> => {
  try {
    const result = await window.electronAPI.storage.delete(origin);
    return result.success;
  } catch (error) {
    console.error('Error deleting storage for origin:', error);
    return false;
  }
};

/**
 * Get a specific localStorage value for an origin
 * @param origin - The origin
 * @param key - The localStorage key
 * @returns Promise resolving to the value or null
 */
export const getStorageValue = async (
  origin: string,
  key: string
): Promise<string | null> => {
  const storage = await getStorageForOrigin(origin);
  return storage[key] || null;
};

