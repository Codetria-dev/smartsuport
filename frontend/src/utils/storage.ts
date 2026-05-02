import { User } from '../types/auth.types';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const DEMO_MODE_KEY = 'demoMode';
const DEMO_USER_KEY = 'demoUser';

export const storage = {
  // Tokens
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    storage.setAccessToken(accessToken);
    storage.setRefreshToken(refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // User
  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  isDemoMode: (): boolean => {
    return localStorage.getItem(DEMO_MODE_KEY) === 'true';
  },

  setDemoMode: (value: boolean): void => {
    if (value) localStorage.setItem(DEMO_MODE_KEY, 'true');
    else localStorage.removeItem(DEMO_MODE_KEY);
  },

  getDemoUser: (): User | null => {
    const raw = localStorage.getItem(DEMO_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  setDemoUser: (user: User): void => {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  },

  clearDemo: (): void => {
    localStorage.removeItem(DEMO_MODE_KEY);
    localStorage.removeItem(DEMO_USER_KEY);
  },

  // Clear all (auth + demo)
  clearAll: (): void => {
    storage.clearTokens();
    storage.clearUser();
    storage.clearDemo();
  },
};
