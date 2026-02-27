import { api } from './api';

export interface ClientListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export const clientService = {
  async getClients(): Promise<ClientListItem[]> {
    const response = await api.get<ClientListItem[]>('/clients');
    return response.data;
  },

  async getClient(id: string): Promise<ClientListItem> {
    const response = await api.get<ClientListItem>(`/clients/${id}`);
    return response.data;
  },

  async deleteClient(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },
};
