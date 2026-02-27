import { api } from './api';
import { Appointment, CreateAppointmentInput } from '../types/appointment';

export const appointmentService = {
  /**
   * Lista agendamentos do usuário logado
   */
  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments/me');
    return response.data;
  },

  /**
   * Obtém um agendamento por ID
   */
  getAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Cria um novo agendamento
   */
  createAppointment: async (data: CreateAppointmentInput): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  /**
   * Confirma um agendamento
   */
  confirmAppointment: async (id: string): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}/confirm`);
    return response.data;
  },

  /**
   * Cancela um agendamento
   */
  cancelAppointment: async (id: string, reason?: string): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Atualiza um agendamento
   */
  updateAppointment: async (
    id: string,
    data: Partial<CreateAppointmentInput>
  ): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}`, data);
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
    const response = await api.post<Appointment>('/appointments/public/book', data);
    return response.data;
  },

  /**
   * Obtém um agendamento pelo token público
   */
  getAppointmentByPublicToken: async (token: string): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/public/appointment/${token}`);
    return response.data;
  },

  /**
   * Cancela um agendamento público pelo token
   */
  cancelPublicAppointment: async (token: string, reason?: string): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/public/appointment/${token}/cancel`, { reason });
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
    const response = await api.get('/appointments/public/providers', {
      params: { _t: Date.now() },
      headers: { 'Cache-Control': 'no-cache' },
    });
    return response.data;
  },
};
