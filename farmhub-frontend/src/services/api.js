import { API_BASE_URL } from '../config';

/**
 * Central API helper for FarmHub.
 * - Automatically attaches `credentials: 'include'` so the JWT cookie
 *   is sent on every request.
 * - Throws a meaningful Error on non-2xx responses so callers can
 *   catch and display messages.
 * - Redirects to login on 401 Unauthorized.
 */
const request = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`;

  // Attempt to get token from localStorage as fallback for cross-site cookie blocking
  let token = localStorage.getItem('token');
  if (!token) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      token = user?.token;
    } catch(e) {}
  }

  const config = {
    credentials: 'include',
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  };

  // Only set Content-Type for JSON bodies (not FormData)
  if (options.body && !(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, config);

  if (res.status === 401) {
    // Clear stale session data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/signin';
    return;
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const errData = await res.json();
      message = errData.message || errData.error || message;
    } catch (_) {
      // ignore parse error
    }
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
};

const api = {
  get: (path) => request(path, { method: 'GET' }),

  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: (path, body) =>
    request(path, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: (path, body) =>
    request(path, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: (path) => request(path, { method: 'DELETE' }),
};

export default api;
