import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';

/**
 * Origem da API (sem /api no fim).
 * VITE_API_URL pode ser https://backend.railway.app ou https://.../api — normalizamos.
 */
export function getApiOrigin(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) {
    return import.meta.env.DEV ? '' : 'http://localhost:3000';
  }
  let u = String(raw).trim().replace(/\/+$/, '');
  if (u.endsWith('/api')) {
    u = u.slice(0, -4);
  }
  return u;
}

const API_ORIGIN = getApiOrigin();

/** baseURL = origem; paths devem começar por /api/... (alinhado ao Express app.use('/api/...')) */
export const api: AxiosInstance = axios.create({
  baseURL: API_ORIGIN,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isPublicAuthRoute =
      originalRequest?.url?.includes('/api/auth/login') ||
      originalRequest?.url?.includes('/api/auth/register') ||
      originalRequest?.url?.includes('/api/auth/forgot-password') ||
      originalRequest?.url?.includes('/api/auth/reset-password') ||
      originalRequest?.url?.includes('/public/');

    if (isPublicAuthRoute) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest?.url?.includes('/api/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = storage.getRefreshToken();
        if (!refreshToken) {
          return Promise.reject(error);
        }

        const refreshUrl = `${API_ORIGIN}/api/auth/refresh`;
        const response = await axios.post(
          refreshUrl,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { accessToken } = response.data;
        if (accessToken) {
          storage.setAccessToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError: unknown) {
        const err = refreshError as { response?: { data?: unknown }; message?: string };
        console.error('Refresh token failed:', err?.response?.data || err?.message);
        storage.clearAll();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
