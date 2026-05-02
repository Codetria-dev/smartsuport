import { User, UserRole, Profile } from '../types/auth.types';
import {
  Appointment,
  AppointmentStatus,
  Availability,
  TimeSlot,
  CreateAppointmentInput,
  CreateAvailabilityInput,
} from '../types/appointment';
import type { ClientListItem } from '../services/clientService';
import type { PlanInfo } from '../services/planService';
import type { SubscriptionInfo } from '../services/billingService';

export const DEMO_USER: User = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo@smartsuport.app',
  role: UserRole.PROVIDER,
  phone: '+55 11 99999-0000',
  plan: 'SMART',
  planStatus: 'ACTIVE',
  profileDescription:
    'Consultoria em atendimento ao cliente e operações. Agenda de demonstração com dados fictícios.',
  isProfileActive: true,
};

const BASE_PROFILE: Profile = {
  id: DEMO_USER.id,
  email: DEMO_USER.email,
  name: DEMO_USER.name,
  phone: DEMO_USER.phone,
  role: 'PROVIDER',
  timezone: 'America/Sao_Paulo',
  plan: 'SMART',
  planStatus: 'ACTIVE',
  planStartDate: new Date().toISOString(),
  isEmailVerified: true,
  profileDescription: DEMO_USER.profileDescription,
  isProfileActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

let profileOverride: Partial<Profile> = {};
let clientsState: ClientListItem[] = [];
let appointmentsState: Appointment[] = [];
let availabilityState: Availability[] = [];

function isoDaysFromNow(days: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function buildSeedClients(): ClientListItem[] {
  const t = new Date().toISOString();
  return [
    {
      id: 'demo-client-1',
      name: 'Maria Silva',
      email: 'maria.silva@email.com',
      phone: '+55 11 98888-1111',
      createdAt: t,
    },
    {
      id: 'demo-client-2',
      name: 'João Santos',
      email: 'joao.santos@empresa.com.br',
      phone: '+55 21 97777-2222',
      createdAt: t,
    },
    {
      id: 'demo-client-3',
      name: 'Ana Costa',
      email: 'ana.costa@startup.io',
      phone: null,
      createdAt: t,
    },
  ];
}

function buildSeedAppointments(clients: ClientListItem[]): Appointment[] {
  const pid = DEMO_USER.id;
  const now = new Date().toISOString();
  const c1 = clients[0];
  const c2 = clients[1];
  return [
    {
      id: 'demo-appt-1',
      providerId: pid,
      clientId: c1.id,
      startTime: isoDaysFromNow(1, 10, 0),
      endTime: isoDaysFromNow(1, 10, 45),
      duration: 45,
      status: AppointmentStatus.CONFIRMED,
      serviceType: 'Consultoria — onboarding',
      title: 'Onboarding SmartSuport',
      description: 'Alinhamento de processos e uso da agenda.',
      location: 'Google Meet',
      meetingLink: 'https://meet.google.com/demo-smartsuport',
      reminderSent: true,
      confirmationSent: true,
      createdAt: now,
      updatedAt: now,
      client: { id: c1.id, name: c1.name, email: c1.email, phone: c1.phone || undefined },
      provider: { id: pid, name: DEMO_USER.name, email: DEMO_USER.email, phone: DEMO_USER.phone },
    },
    {
      id: 'demo-appt-2',
      providerId: pid,
      clientId: c2.id,
      startTime: isoDaysFromNow(3, 14, 30),
      endTime: isoDaysFromNow(3, 15, 0),
      duration: 30,
      status: AppointmentStatus.PENDING,
      serviceType: 'Suporte técnico — prioridade',
      title: 'Revisão de integração',
      reminderSent: false,
      confirmationSent: false,
      createdAt: now,
      updatedAt: now,
      client: { id: c2.id, name: c2.name, email: c2.email, phone: c2.phone || undefined },
      provider: { id: pid, name: DEMO_USER.name, email: DEMO_USER.email, phone: DEMO_USER.phone },
    },
    {
      id: 'demo-appt-3',
      providerId: pid,
      clientId: c1.id,
      startTime: isoDaysFromNow(-2, 9, 0),
      endTime: isoDaysFromNow(-2, 9, 30),
      duration: 30,
      status: AppointmentStatus.COMPLETED,
      serviceType: 'Follow-up',
      title: 'Check-in semanal',
      reminderSent: true,
      confirmationSent: true,
      createdAt: now,
      updatedAt: now,
      client: { id: c1.id, name: c1.name, email: c1.email, phone: c1.phone || undefined },
      provider: { id: pid, name: DEMO_USER.name, email: DEMO_USER.email, phone: DEMO_USER.phone },
    },
  ];
}

function buildSeedAvailability(): Availability[] {
  const pid = DEMO_USER.id;
  const now = new Date().toISOString();
  return [
    {
      id: 'demo-av-1',
      providerId: pid,
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '12:00',
      isRecurring: true,
      timezone: 'America/Sao_Paulo',
      slotDuration: 30,
      bufferTime: 10,
      maxBookingsPerSlot: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-av-2',
      providerId: pid,
      dayOfWeek: 3,
      startTime: '13:00',
      endTime: '18:00',
      isRecurring: true,
      timezone: 'America/Sao_Paulo',
      slotDuration: 30,
      bufferTime: 10,
      maxBookingsPerSlot: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function resetDemoSession(): void {
  profileOverride = {};
  clientsState = buildSeedClients();
  appointmentsState = buildSeedAppointments(clientsState);
  availabilityState = buildSeedAvailability();
}

resetDemoSession();

export function getDemoProfile(): Profile {
  return { ...BASE_PROFILE, ...profileOverride };
}

export function applyDemoProfileUpdate(data: Partial<Profile>): Profile {
  profileOverride = { ...profileOverride, ...data };
  const merged = getDemoProfile();
  return merged;
}

export function getDemoClients(): ClientListItem[] {
  return clientsState.map((c) => ({ ...c }));
}

export function getDemoClient(id: string): ClientListItem | undefined {
  return clientsState.find((c) => c.id === id);
}

export function deleteDemoClient(id: string): boolean {
  const before = clientsState.length;
  clientsState = clientsState.filter((c) => c.id !== id);
  return clientsState.length < before;
}

export function addDemoClient(item: ClientListItem): void {
  clientsState = [item, ...clientsState];
}

export function getDemoAppointments(): Appointment[] {
  return appointmentsState.map((a) => ({ ...a, client: a.client ? { ...a.client } : undefined, provider: a.provider ? { ...a.provider } : undefined }));
}

function findAppointmentIndex(id: string): number {
  return appointmentsState.findIndex((a) => a.id === id);
}

export function getDemoAppointmentById(id: string): Appointment | undefined {
  return getDemoAppointments().find((x) => x.id === id);
}

export function confirmDemoAppointment(id: string): Appointment | undefined {
  const i = findAppointmentIndex(id);
  if (i < 0) return undefined;
  appointmentsState[i] = {
    ...appointmentsState[i],
    status: AppointmentStatus.CONFIRMED,
    updatedAt: new Date().toISOString(),
  };
  return getDemoAppointmentById(id);
}

export function cancelDemoAppointment(id: string, reason?: string): Appointment | undefined {
  const i = findAppointmentIndex(id);
  if (i < 0) return undefined;
  appointmentsState[i] = {
    ...appointmentsState[i],
    status: AppointmentStatus.CANCELLED,
    cancelledAt: new Date().toISOString(),
    cancellationReason: reason,
    updatedAt: new Date().toISOString(),
  };
  return getDemoAppointmentById(id);
}

export function updateDemoAppointment(id: string, data: Partial<CreateAppointmentInput>): Appointment | undefined {
  const i = findAppointmentIndex(id);
  if (i < 0) return undefined;
  const cur = appointmentsState[i];
  const start = data.startTime != null ? data.startTime : cur.startTime;
  const dur = data.duration != null ? data.duration : cur.duration;
  const startMs = new Date(start).getTime();
  const end = new Date(startMs + dur * 60 * 1000).toISOString();
  appointmentsState[i] = {
    ...cur,
    ...data,
    startTime: start,
    endTime: end,
    duration: dur,
    updatedAt: new Date().toISOString(),
  };
  return getDemoAppointmentById(id);
}

export function getDemoAvailabilities(): Availability[] {
  return availabilityState.map((a) => ({ ...a }));
}

export function createDemoAvailability(data: CreateAvailabilityInput): Availability {
  const id = `demo-av-${Date.now()}`;
  const now = new Date().toISOString();
  const row: Availability = {
    id,
    providerId: DEMO_USER.id,
    dayOfWeek: data.dayOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    isRecurring: data.isRecurring !== false,
    startDate: data.startDate,
    endDate: data.endDate,
    timezone: data.timezone || 'America/Sao_Paulo',
    slotDuration: data.slotDuration ?? 30,
    bufferTime: data.bufferTime ?? 10,
    maxBookingsPerSlot: data.maxBookingsPerSlot ?? 1,
    isActive: data.isActive !== false,
    createdAt: now,
    updatedAt: now,
  };
  availabilityState = [...availabilityState, row];
  return { ...row };
}

export function updateDemoAvailability(id: string, data: Partial<CreateAvailabilityInput>): Availability | undefined {
  const i = availabilityState.findIndex((a) => a.id === id);
  if (i < 0) return undefined;
  const cur = availabilityState[i];
  const next: Availability = {
    ...cur,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  availabilityState[i] = next;
  return { ...next };
}

export function deleteDemoAvailability(id: string): boolean {
  const before = availabilityState.length;
  availabilityState = availabilityState.filter((a) => a.id !== id);
  return availabilityState.length < before;
}

/** Slots fictícios para o preview na página de disponibilidade */
export function getDemoAvailableSlots(_providerId: string, startDate: string, endDate: string): TimeSlot[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const slots: TimeSlot[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].forEach((time) => {
      slots.push({ date: dateStr, time, available: true });
    });
  }
  return slots;
}

export function getDemoPlanInfo(): PlanInfo {
  return {
    plan: 'SMART',
    status: 'ACTIVE',
    startDate: BASE_PROFILE.planStartDate,
    limits: {
      maxAppointmentsPerMonth: 200,
      maxProvidersPerAccount: 3,
      features: ['basic_scheduling', 'email_notifications', 'public_booking_page'],
    },
    features: ['basic_scheduling', 'email_notifications', 'public_booking_page'],
  };
}

export function getDemoSubscription(): SubscriptionInfo {
  return {
    hasActiveSubscription: true,
    plan: 'SMART',
    status: 'ACTIVE',
    currentPeriodEnd: isoDaysFromNow(25, 12, 0),
    cancelAtPeriodEnd: false,
    gatewayId: 'demo',
  };
}

export function registerDemoClient(data: {
  name: string;
  email: string;
  phone?: string;
}): ClientListItem {
  const item: ClientListItem = {
    id: `demo-client-${Date.now()}`,
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    createdAt: new Date().toISOString(),
  };
  addDemoClient(item);
  return item;
}
