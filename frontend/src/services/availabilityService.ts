import { api } from './api';
import { Availability, TimeSlot, CreateAvailabilityInput } from '../types/appointment';

export const availabilityService = {
  /**
   * Lista disponibilidades do provider logado
   */
  getMyAvailabilities: async (): Promise<Availability[]> => {
    const response = await api.get<Availability[]>('/availability/me');
    return response.data;
  },

  /**
   * Cria uma nova disponibilidade
   */
  createAvailability: async (data: CreateAvailabilityInput): Promise<Availability> => {
    const response = await api.post<Availability>('/availability', data);
    return response.data;
  },

  /**
   * Atualiza uma disponibilidade
   */
  updateAvailability: async (
    id: string,
    data: Partial<CreateAvailabilityInput>
  ): Promise<Availability> => {
    const response = await api.put<Availability>(`/availability/${id}`, data);
    return response.data;
  },

  /**
   * Deleta uma disponibilidade
   */
  deleteAvailability: async (id: string): Promise<void> => {
    await api.delete(`/availability/${id}`);
  },

  /**
   * Obtém slots disponíveis de um provider (público)
   */
  getAvailableSlots: async (
    providerId: string,
    startDate: string,
    endDate: string
  ): Promise<TimeSlot[]> => {
    const response = await api.get<TimeSlot[]>(`/availability/public/${providerId}/slots`, {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data;
  },
};
