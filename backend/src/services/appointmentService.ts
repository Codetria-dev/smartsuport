import { Appointment } from '@prisma/client';
import { CreateAppointmentInput, UpdateAppointmentInput } from '../schemas/appointment.schema';
import { CreatePublicAppointmentInput } from '../schemas/publicAppointment.schema';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../config/database';
import { availabilityService } from './availabilityService';
import { emailService } from './emailService';
import { randomUUID } from 'crypto';

export class AppointmentService {
  /**
   * Cria um novo agendamento
   */
  async createAppointment(
    clientId: string,
    data: CreateAppointmentInput
  ): Promise<Appointment> {
    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + data.duration * 60000);

    // Validações
    if (startTime < new Date()) {
      throw new AppError('Não é possível agendar no passado', 400);
    }

    // Verifica se o provider existe e é um provider
    const provider = await prisma.user.findUnique({
      where: { id: data.providerId },
    });

    if (!provider) {
      throw new AppError('Provider não encontrado', 404);
    }

    if (provider.role !== 'PROVIDER' && provider.role !== 'ADMIN') {
      throw new AppError('Usuário não é um provider', 400);
    }

    // Verifica se há disponibilidade para este horário
    const slots = await availabilityService.getAvailableSlots(
      data.providerId,
      startTime,
      endTime
    );

    const dateStr = startTime.toISOString().split('T')[0];
    const timeStr = startTime.toTimeString().slice(0, 5);
    
    const slot = slots.find(
      (s) => s.date === dateStr && s.time === timeStr
    );

    if (!slot || !slot.available) {
      throw new AppError('Horário não disponível', 400);
    }

    // Verifica conflitos: sobreposição = existente.startTime < novo.endTime E existente.endTime > novo.startTime
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        providerId: data.providerId,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (conflictingAppointment) {
      throw new AppError('Já existe um agendamento neste horário', 400);
    }

    // Cria o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        providerId: data.providerId,
        clientId,
        startTime,
        endTime,
        duration: data.duration,
        status: 'PENDING',
        serviceType: data.serviceType,
        title: data.title,
        description: data.description,
        location: data.location,
        meetingLink: data.meetingLink || null,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Envia email de confirmação (não bloqueia a resposta)
    if (appointment.client?.email) {
      const clientName = appointment.client.name || 'Cliente';
      const appointmentDate = startTime.toLocaleDateString('pt-BR');
      const appointmentTime = startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      emailService.sendAppointmentConfirmation({
        to: appointment.client.email,
        clientName,
        providerName: appointment.provider.name,
        appointmentDate,
        appointmentTime,
        duration: data.duration,
        location: data.location ?? undefined,
      }).catch((err) => console.error('Erro ao enviar email de confirmação (agendamento):', err));
    }

    return appointment as Appointment;
  }

  /**
   * Cria um agendamento público (sem autenticação)
   */
  async createPublicAppointment(
    data: CreatePublicAppointmentInput
  ): Promise<Appointment> {
    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + data.duration * 60000);

    if (startTime < new Date()) {
      throw new AppError('Não é possível agendar no passado', 400);
    }

    const provider = await prisma.user.findUnique({
      where: { id: data.providerId },
    });

    if (!provider) {
      throw new AppError('Profissional não encontrado', 404);
    }

    if (provider.role !== 'PROVIDER' && provider.role !== 'ADMIN') {
      throw new AppError('Usuário não é um profissional', 400);
    }

    const slots = await availabilityService.getAvailableSlots(
      data.providerId,
      startTime,
      endTime
    );

    const dateStr = startTime.toISOString().split('T')[0];
    const timeStr = startTime.toTimeString().slice(0, 5);
    const slot = slots.find((s) => s.date === dateStr && s.time === timeStr);

    if (!slot || !slot.available) {
      throw new AppError('Horário não disponível', 400);
    }

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        providerId: data.providerId,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (conflictingAppointment) {
      throw new AppError('Já existe um agendamento neste horário', 400);
    }

    const publicToken = randomUUID();

    const appointment = await prisma.appointment.create({
      data: {
        providerId: data.providerId,
        clientId: null,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone ?? null,
        publicToken,
        startTime,
        endTime,
        duration: data.duration,
        status: 'PENDING',
        serviceType: data.serviceType ?? null,
        title: data.title ?? null,
        description: data.description ?? null,
        location: data.location ?? null,
        meetingLink: data.meetingLink ?? null,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Envia email de confirmação com link de acesso público (não bloqueia a resposta)
    const appointmentDate = startTime.toLocaleDateString('pt-BR');
    const appointmentTime = startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    emailService.sendAppointmentConfirmation({
      to: data.clientEmail,
      clientName: data.clientName,
      providerName: provider.name,
      appointmentDate,
      appointmentTime,
      duration: data.duration,
      location: data.location ?? undefined,
      publicToken,
    }).catch((err) => console.error('Erro ao enviar email de confirmação (agendamento público):', err));

    return appointment;
  }

  /**
   * Obtém um agendamento pelo token público
   */
  async getAppointmentByPublicToken(token: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { publicToken: token },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    return appointment;
  }

  /**
   * Cancela um agendamento público pelo token
   */
  async cancelPublicAppointment(
    token: string,
    reason?: string
  ): Promise<Appointment> {
    const appointment = await prisma.appointment.findUnique({
      where: { publicToken: token },
    });

    if (!appointment) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    if (appointment.status === 'CANCELLED') {
      throw new AppError('Agendamento já está cancelado', 400);
    }

    if (appointment.status === 'COMPLETED') {
      throw new AppError('Não é possível cancelar um agendamento concluído', 400);
    }

    return prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason ?? null,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Lista agendamentos do usuário logado
   */
  async getUserAppointments(userId: string, role: string) {
    const where: any = {};

    if (role === 'PROVIDER' || role === 'ADMIN') {
      where.providerId = userId;
    } else {
      where.clientId = userId;
    }

    return prisma.appointment.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  /**
   * Obtém um agendamento por ID
   */
  async getAppointmentById(id: string, userId: string, role: string): Promise<Appointment | null> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      return null;
    }

    // Verifica permissão
    if (
      role !== 'ADMIN' &&
      appointment.providerId !== userId &&
      appointment.clientId !== userId
    ) {
      throw new AppError('Você não tem permissão para ver este agendamento', 403);
    }

    return appointment;
  }

  /**
   * Confirma um agendamento (apenas provider)
   */
  async confirmAppointment(
    id: string,
    providerId: string
  ): Promise<Appointment> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    if (appointment.providerId !== providerId) {
      throw new AppError('Você não tem permissão para confirmar este agendamento', 403);
    }

    if (appointment.status !== 'PENDING') {
      throw new AppError(
        `Apenas agendamentos pendentes podem ser confirmados. Status atual: ${appointment.status}`,
        400
      );
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmationSent: true,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Cancela um agendamento
   */
  async cancelAppointment(
    id: string,
    userId: string,
    role: string,
    reason?: string
  ): Promise<Appointment> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    // Verifica permissão
    if (
      role !== 'ADMIN' &&
      appointment.providerId !== userId &&
      appointment.clientId !== userId
    ) {
      throw new AppError('Você não tem permissão para cancelar este agendamento', 403);
    }

    if (appointment.status === 'CANCELLED') {
      throw new AppError('Agendamento já está cancelado', 400);
    }

    if (appointment.status === 'COMPLETED') {
      throw new AppError('Não é possível cancelar um agendamento concluído', 400);
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason: reason,
      },
    });
  }

  /**
   * Atualiza um agendamento
   */
  async updateAppointment(
    id: string,
    userId: string,
    role: string,
    data: UpdateAppointmentInput
  ): Promise<Appointment> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new AppError('Agendamento não encontrado', 404);
    }

    // Verifica permissão
    if (
      role !== 'ADMIN' &&
      appointment.providerId !== userId &&
      appointment.clientId !== userId
    ) {
      throw new AppError('Você não tem permissão para atualizar este agendamento', 403);
    }

    // Não permite atualizar agendamentos cancelados ou concluídos
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      throw new AppError('Não é possível atualizar um agendamento cancelado ou concluído', 400);
    }

    const updateData: any = { ...data };
    let newStartTime: Date | null = null;
    let newEndTime: Date | null = null;

    // Se está atualizando o horário, recalcula endTime e valida conflitos
    if (data.startTime) {
      newStartTime = new Date(data.startTime);
      const duration = data.duration || appointment.duration;
      newEndTime = new Date(newStartTime.getTime() + duration * 60000);

      // Validações
      if (newStartTime < new Date()) {
        throw new AppError('Não é possível agendar no passado', 400);
      }

      // Verifica conflitos com outros agendamentos (exceto o próprio)
      // Sobreposição: existente.startTime < novo.endTime E existente.endTime > novo.startTime
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          providerId: appointment.providerId,
          id: { not: id },
          startTime: { lt: newEndTime },
          endTime: { gt: newStartTime },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (conflictingAppointment) {
        throw new AppError('Já existe um agendamento neste horário', 400);
      }

      updateData.endTime = newEndTime;
    } else if (data.duration) {
      const startTime = new Date(appointment.startTime);
      updateData.endTime = new Date(startTime.getTime() + data.duration * 60000);
    }

    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }

    return prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }
}

export const appointmentService = new AppointmentService();
