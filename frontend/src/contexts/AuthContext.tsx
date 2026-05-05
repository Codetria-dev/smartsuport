import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth.types';
import { storage } from '../utils/storage';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { DEMO_USER, resetDemoSession } from '../demo/demoData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  enterDemo: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (storage.isDemoMode()) {
          const du = storage.getDemoUser();
          if (du) {
            setUser(du);
            return;
          }
          storage.clearDemo();
        }

        const storedUser = storage.getUser();
        const token = storage.getAccessToken();

        if (storedUser && token) {
          setUser(storedUser);
          try {
            const profile = await authService.getProfile();
            const freshUser: User = {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role as User['role'],
              phone: profile.phone,
              plan: profile.plan,
              planStatus: profile.planStatus,
              profileDescription: profile.profileDescription,
              isProfileActive: profile.isProfileActive,
            };
            storage.setUser(freshUser);
            setUser(freshUser);
          } catch {
            // Mantém usuário do storage se a API falhar (ex.: token expirado)
          }
        } else {
          storage.clearAll();
        }
      } catch (error) {
        const err = error as { response?: { status?: number; data?: unknown }; message?: string };
        console.error('Error loading user:', err?.response?.status, err?.response?.data || err?.message);
        storage.clearAll();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const enterDemo = () => {
    resetDemoSession();
    storage.clearTokens();
    storage.clearUser();
    storage.setDemoMode(true);
    storage.setDemoUser(DEMO_USER);
    setUser(DEMO_USER);
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      storage.clearDemo();
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      const { user: u, accessToken, refreshToken } = response.data;

      storage.setTokens(accessToken, refreshToken);
      storage.setUser(u);
      setUser(u);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao fazer login';
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      storage.clearDemo();
      console.log('[Auth] Enviando registro:', { ...data, password: '***' });
      const response = await api.post<AuthResponse>('/api/auth/register', data);
      console.log('[Auth] Registro resposta:', response.status, response.data);
      const { user: u, accessToken, refreshToken } = response.data;

      if (!u || !accessToken || !refreshToken) {
        console.error('[Auth] Resposta incompleta do backend:', response.data);
        throw new Error('Resposta invalida do servidor');
      }

      storage.setTokens(accessToken, refreshToken);
      storage.setUser(u);
      setUser(u);
      console.log('[Auth] Registro concluido, usuario:', u.email);
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.error('[Auth] Erro no registro:', { status, data, message: error.message });
      const message = data?.error || 'Erro ao registrar';
      throw new Error(message);
    }
  };

  const logout = () => {
    if (storage.isDemoMode()) {
      storage.clearAll();
      setUser(null);
      return;
    }
    const refreshToken = storage.getRefreshToken();
    storage.clearAll();
    setUser(null);
    if (refreshToken) {
      api.post('/api/auth/logout', { refreshToken }).catch(() => {});
    }
  };

  const updateUser = (updatedUser: User) => {
    if (storage.isDemoMode()) {
      storage.setDemoUser(updatedUser);
    } else {
      storage.setUser(updatedUser);
    }
    setUser(updatedUser);
  };

  const isDemoMode = storage.isDemoMode() && !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isDemoMode,
    enterDemo,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
