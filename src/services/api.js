const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const ACCESS_TOKEN_KEY = 'flora_access_token';
const REFRESH_TOKEN_KEY = 'flora_refresh_token';

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status || 0;
    this.code = options.code || null;
    this.payload = options.payload || null;
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || '';
}

export function setAuthSession({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function handleUnauthorized(payload) {
  clearAuthSession();
  window.dispatchEvent(new CustomEvent('auth:logout', { detail: payload || null }));
  if (!window.location.pathname.includes('/login')) {
    window.location.assign('/login');
  }
}

async function parseResponse(response) {
  const text = await response.text();
  let payload = {};

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized(payload);
    }

    const message = response.status === 403
      ? 'You do not have permission to perform this action.'
      : payload?.message || 'Request failed';

    throw new ApiError(message, {
      status: response.status,
      code: payload?.code,
      payload,
    });
  }

  return payload;
}

async function attemptRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    handleUnauthorized(payload);
    return false;
  }

  const payload = await response.json();
  setAuthSession({
    accessToken: payload?.data?.accessToken,
    refreshToken: payload?.data?.refreshToken,
  });
  window.dispatchEvent(new CustomEvent('auth:refresh', { detail: payload?.data || null }));
  return true;
}

export async function apiRequest(path, options = {}, config = {}) {
  const { requiresAuth = false, retryOn401 = true } = config;
  const headers = { ...(options.headers || {}) };
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (requiresAuth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Backend server is unreachable', { status: 0 });
  }

  if (response.status === 401 && requiresAuth && retryOn401) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      return apiRequest(path, options, { ...config, retryOn401: false });
    }
  }

  return parseResponse(response);
}

export const get = (path, config) => apiRequest(path, { method: 'GET' }, config);
export const post = (path, body, config) => apiRequest(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }, config);
export const patch = (path, body, config) => apiRequest(path, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }, config);
export const put = (path, body, config) => apiRequest(path, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }, config);
export const del = (path, config) => apiRequest(path, { method: 'DELETE' }, config);
