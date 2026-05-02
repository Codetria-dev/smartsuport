import { api } from './api';
import { storage } from '../utils/storage';
import { Availability, TimeSlot, CreateAvailabilityInput } from '../types/appointment';
import {
  getDemoAvailabilities,
  createDemoAvailability,
  updateDemoAvailability,
  deleteDemoAvailability,
  getDemoAvailableSlots,
} from '../demo/demoData';

export const availabilityService = {
  /**
   * Lista disponibilidades do provider logado
   */
  getMyAvailabilities: async (): Promise<Availability[]> => {
    if (storage.isDemoMode()) {
      return Promise.resolve(getDemoAvailabilities());
    }
    const response = await api.get<Availability[]>('/api/availability/me');
    return response.data;
  },

  /**
   * Cria uma nova disponibilidade
   */
  createAvailability: async (data: CreateAvailabilityInput): Promise<Availability> => {
    if (storage.isDemoMode()) {
      return Promise.resolve(createDemoAvailability(data));
    }
    const response = await api.post<Availability>('/api/availability', data);
    return response.data;
  },

  /**
   * Atualiza uma disponibilidade
   */
  updateAvailability: async (
    id: string,
    data: Partial<CreateAvailabilityInput>
  ): Promise<Availability> => {
    if (storage.isDemoMode()) {
      const a = updateDemoAvailability(id, data);
      if (!a) return Promise.reject(new Error('Not found'));
      return Promise.resolve(a);
    }
    const response = await api.put<Availability>(`/api/availability/${id}`, data);
    return response.data;
  },

  /**
   * Deleta uma disponibilidade
   */
  deleteAvailability: async (id: string): Promise<void> => {
    if (storage.isDemoMode()) {
      if (!deleteDemoAvailability(id)) return Promise.reject(new Error('Not found'));
      return Promise.resolve();
    }
    await api.delete(`/api/availability/${id}`);
  },

  /**
   * Obtém slots disponíveis de um provider (público)
   */
  getAvailableSlots: async (
    providerId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeSlot[]> => {
    if (storage.isDemoMode()) {
      return Promise.resolve(getDemoAvailableSlots(providerId, startDate, endDate));
    }
    const response = await api.get<TimeSlot[]>(`/api/availability/public/${providerId}/slots`, {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data;
  },
};
