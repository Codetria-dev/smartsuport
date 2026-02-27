import { api } from './api';

export interface DashboardStats {
  users: {
    total: number;
    providers: number;
    free: number;
    pro: number;
  };
  appointments: {
    total: number;
    active: number;
    byMonth: Array<{ createdAt: string; _count: number }>;
  };
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  planStatus: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface UsersListResponse {
  users: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserDetails extends UserListItem {
  phone?: string;
  planStartDate?: string;
  planEndDate?: string;
  isEmailVerified: boolean;
  updatedAt: string;
  _count: {
    appointmentsAsProvider: number;
    appointmentsAsClient: number;
    availabilities: number;
  };
}

export const adminService = {
  /**
   * Obtém estatísticas do dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  /**
   * Lista usuários
   */
  async listUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    plan?: string;
    isActive?: boolean;
  }): Promise<UsersListResponse> {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Obtém detalhes de um usuário
   */
  async getUserDetails(userId: string): Promise<UserDetails> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Ativa/desativa usuário
   */
  async toggleUserStatus(userId: string, isActive: boolean) {
    const response = await api.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  /**
   * Atualiza plano do usuário
   */
  async updateUserPlan(userId: string, plan: 'FREE' | 'PRO', status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED') {
    const response = await api.put(`/admin/users/${userId}/plan`, { plan, status });
    return response.data;
  },

  /**
   * Lista agendamentos
   */
  async listAppointments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    providerId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await api.get('/admin/appointments', { params });
    return response.data;
  },
};
