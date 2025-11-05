/**
 * API Configuration
 * Centralized API base URL for all API calls
 */
export const API_BASE_URL = 'https://api.body-composition.contactsunny.com';

/**
 * Constructs a full API URL from a path
 * @param path - API endpoint path (e.g., '/auth/login', '/users/profile')
 * @returns Full API URL
 */
export const getApiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

