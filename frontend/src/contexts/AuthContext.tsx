import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth.types';
import { storage } from '../utils/storage';
import { api } from '../services/api';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega usuário do storage e atualiza com perfil da API (role correto do backend)
  useEffect(() => {
    const loadUser = async () => {
      try {
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
        console.error('Error loading user:', error);
        storage.clearAll();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data;

      storage.setTokens(accessToken, refreshToken);
      storage.setUser(user);
      setUser(user);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao fazer login';
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { user, accessToken, refreshToken } = response.data;

      storage.setTokens(accessToken, refreshToken);
      storage.setUser(user);
      setUser(user);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao registrar';
      throw new Error(message);
    }
  };

  const logout = () => {
    const refreshToken = storage.getRefreshToken();
    storage.clearAll();
    setUser(null);
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
  };

  const updateUser = (updatedUser: User) => {
    storage.setUser(updatedUser);
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
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
