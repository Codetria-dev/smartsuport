import { api } from './api';
import { storage } from '../utils/storage';
import { getDemoClients, getDemoClient, deleteDemoClient } from '../demo/demoData';

export interface ClientListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export const clientService = {
  async getClients(): Promise<ClientListItem[]> {
    if (storage.isDemoMode()) {
      return Promise.resolve(getDemoClients());
    }
    const response = await api.get<ClientListItem[]>('/api/clients');
    return response.data;
  },

  async getClient(id: string): Promise<ClientListItem> {
    if (storage.isDemoMode()) {
      const c = getDemoClient(id);
      if (!c) return Promise.reject(new Error('Not found'));
      return Promise.resolve(c);
    }
    const response = await api.get<ClientListItem>(`/api/clients/${id}`);
    return response.data;
  },

  async deleteClient(id: string): Promise<void> {
    if (storage.isDemoMode()) {
      if (!deleteDemoClient(id)) return Promise.reject(new Error('Not found'));
      return Promise.resolve();
    }
    await api.delete(`/api/clients/${id}`);
  },
};
