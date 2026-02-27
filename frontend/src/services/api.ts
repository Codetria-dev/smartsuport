import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';

// Em dev: usa /api para o proxy do Vite (localhost:5173 → localhost:3000)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3000/api');

// Cria instância do axios
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ignora erros em rotas públicas (login, register, forgot-password, reset-password)
    // Mas permite refresh token tentar fazer refresh
    const isPublicAuthRoute = originalRequest?.url?.includes('/auth/login') || 
                              originalRequest?.url?.includes('/auth/register') ||
                              originalRequest?.url?.includes('/auth/forgot-password') ||
                              originalRequest?.url?.includes('/auth/reset-password') ||
                              originalRequest?.url?.includes('/public/');
    
    if (isPublicAuthRoute) {
      return Promise.reject(error);
    }

    // Se erro 401 e não foi tentado refresh ainda
    // Não tenta refresh se já está tentando fazer refresh (evita loop)
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest?.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;

      try {
        const refreshToken = storage.getRefreshToken();
        if (!refreshToken) {
          // Se não há refresh token, apenas rejeita sem redirecionar
          // (pode ser uma rota pública ou usuário não autenticado)
          return Promise.reject(error);
        }

        // Tenta renovar o token apenas se houver refresh token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const { accessToken } = response.data;
        if (accessToken) {
          storage.setAccessToken(accessToken);

          // Repete a requisição original com o novo token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError: any) {
        // Se falhar, limpa storage mas não redireciona automaticamente
        // (deixa o componente decidir o que fazer)
        console.error('Refresh token failed:', refreshError?.response?.data || refreshError.message);
        storage.clearAll();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
