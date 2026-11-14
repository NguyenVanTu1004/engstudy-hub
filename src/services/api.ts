export const TOKEN_STORAGE_KEY = 'engstudy_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = false, headers = {}, ...rest } = options;
  const token = getAuthToken();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    headers: requestHeaders,
    ...rest,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && requiresAuth) {
      removeAuthToken();
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    throw new Error(data.message || `Lỗi yêu cầu máy chủ (mã ${response.status})`);
  }

  return data as T;
}

export const api = {
  get: <T = any>(url: string, requiresAuth = false) => apiRequest<T>(url, { method: 'GET', requiresAuth }),
  post: <T = any>(url: string, body?: any, requiresAuth = false) =>
    apiRequest<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth,
    }),
  put: <T = any>(url: string, body?: any, requiresAuth = false) =>
    apiRequest<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth,
    }),
  delete: <T = any>(url: string, requiresAuth = false) =>
    apiRequest<T>(url, { method: 'DELETE', requiresAuth }),
};
