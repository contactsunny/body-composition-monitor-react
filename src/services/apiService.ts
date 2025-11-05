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

  const headers = new Headers(options.headers as HeadersInit);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('token', token);
  }

  return fetch(getApiUrl(path), {
    ...options,
    headers,
  });
};

