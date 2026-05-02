import { api } from './api';
import { Profile, RegisterData, LoginCredentials } from '../types/auth.types';
import { storage } from '../utils/storage';
import {
  getDemoProfile,
  applyDemoProfileUpdate,
  registerDemoClient,
} from '../demo/demoData';

export const authService = {
  /**
   * Registra um novo usuário
   */
  async register(data: RegisterData) {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  /**
   * Cadastra um novo cliente (apenas profissional/admin no painel)
   */
  async registerClient(data: { name: string; email: string; password: string; phone?: string }) {
    if (storage.isDemoMode()) {
      return { client: registerDemoClient(data) };
    }
    const response = await api.post('/api/auth/register-client', data);
    return response.data;
  },

  /**
   * Faz login
   */
  async login(credentials: LoginCredentials) {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Atualiza access token usando refresh token
   */
  async refreshToken(refreshToken: string) {
    const response = await api.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Solicita reset de senha
   */
  async forgotPassword(email: string) {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reseta senha usando token
   */
  async resetPassword(token: string, password: string) {
    const response = await api.post('/api/auth/reset-password', { token, password });
    return response.data;
  },

  /**
   * Obtém perfil do usuário logado
   */
  async getProfile(): Promise<Profile> {
    if (storage.isDemoMode()) {
      return Promise.resolve(getDemoProfile());
    }
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  /**
   * Atualiza perfil do usuário logado
   */
  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    if (storage.isDemoMode()) {
      return Promise.resolve(applyDemoProfileUpdate(data));
    }
    const response = await api.put('/api/auth/me', data);
    return response.data;
  },

  /**
   * Altera senha
   */
  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Faz logout
   */
  async logout() {
    await api.post('/api/auth/logout');
  },
};
