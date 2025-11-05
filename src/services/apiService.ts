import { getApiUrl } from '../config/api';

/**
 * Get the authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Make an authenticated API request
 * Automatically includes the token header
 */
export const authenticatedFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['token'] = token;
  }

  return fetch(getApiUrl(path), {
    ...options,
    headers,
  });
};

