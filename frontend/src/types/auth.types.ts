export enum UserRole {
  ADMIN = 'ADMIN',
  PROVIDER = 'PROVIDER',
  CLIENT = 'CLIENT',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  plan?: string;
  planStatus?: string;
  profileDescription?: string;
  isProfileActive?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'ADMIN' | 'PROVIDER' | 'CLIENT';
}

// Backend retorna { user, accessToken, refreshToken }
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  timezone: string;
  avatar?: string;
  plan: string;
  planStatus: string;
  planStartDate?: string;
  planEndDate?: string;
  trialEndsAt?: string;
  isEmailVerified: boolean;
  profileDescription?: string;
  isProfileActive?: boolean;
  createdAt: string;
  updatedAt: string;
}
