export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export interface Availability {
  id: string;
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  startDate?: string;
  endDate?: string;
  timezone: string;
  slotDuration: number;
  bufferTime: number;
  maxBookingsPerSlot: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  providerId: string;
  clientId?: string; // Opcional para agendamentos públicos
  clientName?: string; // Para agendamentos públicos
  clientEmail?: string; // Para agendamentos públicos
  clientPhone?: string; // Para agendamentos públicos
  publicToken?: string; // Token único para acesso público
  startTime: string;
  endTime: string;
  duration: number;
  status: AppointmentStatus;
  serviceType?: string;
  title?: string;
  description?: string;
  location?: string;
  meetingLink?: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  confirmationSent: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

export interface CreateAvailabilityInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring?: boolean;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  slotDuration?: number;
  bufferTime?: number;
  maxBookingsPerSlot?: number;
  isActive?: boolean;
}

export interface CreateAppointmentInput {
  providerId: string;
  clientId?: string; // Quando o provider agenda para um cliente
  startTime: string;
  duration: number;
  serviceType?: string;
  title?: string;
  description?: string;
  location?: string;
  meetingLink?: string;
}
