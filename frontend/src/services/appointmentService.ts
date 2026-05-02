import { api } from './api';
import { storage } from '../utils/storage';
import { Appointment, CreateAppointmentInput } from '../types/appointment';
import {
  getDemoAppointments,
  getDemoAppointmentById,
  confirmDemoAppointment,
  cancelDemoAppointment,
  updateDemoAppointment,
} from '../demo/demoData';

export const appointmentService = {
  /**
   * Lista agendamentos do usuário logado
   */
  getMyAppointments: async (): Promise<Appointment[]> => {
    if (storage.isDemoMode()) {
      return Promise.resolve(getDemoAppointments());
    }
    const response = await api.get<Appointment[]>('/api/appointments/me');
    return response.data;
  },

  /**
   * Obtém um agendamento por ID
   */
  getAppointmentById: async (id: string): Promise<Appointment> => {
    if (storage.isDemoMode()) {
      const a = getDemoAppointmentById(id);
      if (!a) return Promise.reject(new Error('Not found'));
      return Promise.resolve(a);
    }
    const response = await api.get<Appointment>(`/api/appointments/${id}`);
    return response.data;
  },

  /**
   * Cria um novo agendamento
   */
  createAppointment: async (data: CreateAppointmentInput): Promise<Appointment> => {
    if (storage.isDemoMode()) {
      return Promise.reject(new Error('Demo mode: scheduling is view-only.'));
    }
    const response = await api.post<Appointment>('/api/appointments', data);
    return response.data;
  },

  /**
   * Confirma um agendamento
   */
  confirmAppointment: async (id: string): Promise<Appointment> => {
    if (storage.isDemoMode()) {
      const a = confirmDemoAppointment(id);
      if (!a) return Promise.reject(new Error('Not found'));
      return Promise.resolve(a);
    }
    const response = await api.put<Appointment>(`/api/appointments/${id}/confirm`);
    return response.data;
  },

  /**
   * Cancela um agendamento
   */
  cancelAppointment: async (id: string, reason?: string): Promise<Appointment> => {
    if (storage.isDemoMode()) {
      const a = cancelDemoAppointment(id, reason);
      if (!a) return Promise.reject(new Error('Not found'));
      return Promise.resolve(a);
    }
    const response = await api.put<Appointment>(`/api/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Atualiza um agendamento
   */
  updateAppointment: async (
    id: string,
    data: Partial<CreateAppointmentInput>
  ): Promise<Appointment> => {
    if (storage.isDemoMode()) {
      const a = updateDemoAppointment(id, data);
      if (!a) return Promise.reject(new Error('Not found'));
      return Promise.resolve(a);
    }
    const response = await api.put<Appointment>(`/api/appointments/${id}`, data);
    return response.data;
  },

  /**
   * Cria um agendamento público (sem autenticação)
   */
  createPublicAppointment: async (data: {
    providerId: string;
    startTime: string;
    duration: number;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    serviceType?: string;
    title?: string;
    description?: string;
    location?: string;
    meetingLink?: string;
  }): Promise<Appointment> => {
    const response = await api.post<Appointment>('/api/appointments/public/book', data);
    return response.data;
  },

  /**
   * Obtém um agendamento pelo token público
   */
  getAppointmentByPublicToken: async (token: string): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/api/appointments/public/appointment/${token}`);
    return response.data;
  },

  /**
   * Cancela um agendamento público pelo token
   */
  cancelPublicAppointment: async (token: string, reason?: string): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/api/appointments/public/appointment/${token}/cancel`, { reason });
    return response.data;
  },

  /**
   * Lista providers disponíveis (público)
   */
  getPublicProviders: async (): Promise<Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    profileDescription?: string;
  }>> => {
    const response = await api.get('/api/appointments/public/providers', {
      params: { _t: Date.now() },
      headers: { 'Cache-Control': 'no-cache' },
    });
    return response.data;
  },
};
