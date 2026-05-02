import { Availability } from '@prisma/client';
import { CreateAvailabilityInput, UpdateAvailabilityInput } from '../schemas/availability.schema';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../config/database';
import { generateTimeSlots, timeToMinutes, combineDateTime } from '../utils/dateHelpers';

export class AvailabilityService {
  /**
   * Cria uma nova disponibilidade
   */
  async createAvailability(
    providerId: string,
    data: CreateAvailabilityInput
  ): Promise<Availability> {
    // Verifica se já existe disponibilidade para o mesmo dia
    const existing = await prisma.availability.findFirst({
      where: {
        providerId,
        dayOfWeek: data.dayOfWeek,
        isActive: true,
      },
    });

    if (existing) {
      throw new AppError(
        'Já existe uma disponibilidade ativa para este dia da semana',
        400
      );
    }

    return prisma.availability.create({
      data: {
        provider: { connect: { id: providerId } },
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isRecurring: data.isRecurring ?? true,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        timezone: data.timezone ?? 'America/Sao_Paulo',
        slotDuration: data.slotDuration ?? 30,
        bufferTime: data.bufferTime ?? 0,
        maxBookingsPerSlot: data.maxBookingsPerSlot ?? 1,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Lista todas as disponibilidades de um provider
   */
  async getProviderAvailabilities(providerId: string): Promise<Availability[]> {
    return prisma.availability.findMany({
      where: {
        providerId,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  /**
   * Atualiza uma disponibilidade
   */
  async updateAvailability(
    id: string,
    providerId: string,
    data: UpdateAvailabilityInput
  ): Promise<Availability> {
    const availability = await prisma.availability.findUnique({
      where: { id },
    });

    if (!availability) {
      throw new AppError('Disponibilidade não encontrada', 404);
    }

    if (availability.providerId !== providerId) {
      throw new AppError('Você não tem permissão para atualizar esta disponibilidade', 403);
    }

    return prisma.availability.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  /**
   * Deleta uma disponibilidade
   */
  async deleteAvailability(id: string, providerId: string): Promise<void> {
    const availability = await prisma.availability.findUnique({
      where: { id },
    });

    if (!availability) {
      throw new AppError('Disponibilidade não encontrada', 404);
    }

    if (availability.providerId !== providerId) {
      throw new AppError('Você não tem permissão para deletar esta disponibilidade', 403);
    }

    await prisma.availability.delete({
      where: { id },
    });
  }

  /**
   * Cria disponibilidade padrão (Segunda a Sexta, 9h-17h) para um provider
   * que ainda não tenha nenhuma disponibilidade configurada.
   * Útil para onboarding — chamada explicitamente pelo provider.
   */
  async seedDefaultAvailabilities(
    providerId: string
  ): Promise<Availability[]> {
    const provider = await prisma.user.findUnique({
      where: { id: providerId, role: { in: ['PROVIDER', 'ADMIN'] } },
    });
    if (!provider) {
      throw new AppError('Provider não encontrado', 404);
    }

    const existing = await prisma.availability.findMany({
      where: { providerId },
    });
    if (existing.length > 0) {
      return existing;
    }

    const daysOfWeek = [1, 2, 3, 4, 5]; // Segunda a Sexta
    const defaultData = {
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true,
      slotDuration: 60,
      bufferTime: 0,
      maxBookingsPerSlot: 1,
      isActive: true,
      timezone: 'America/Sao_Paulo',
    };

    for (const dayOfWeek of daysOfWeek) {
      await prisma.availability.create({
        data: {
          provider: { connect: { id: providerId } },
          dayOfWeek,
          ...defaultData,
        },
      });
    }

    return prisma.availability.findMany({
      where: { providerId, isActive: true },
    });
  }

  /**
   * Calcula slots disponíveis de um provider em um período
   * Nota: antes de chamar esta rota, o provider deve ter disponibilidades cadastradas
   * (use POST /api/availability/seed para criar o padrão se necessário).
   */
  async getAvailableSlots(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ date: string; time: string; available: boolean }>> {
    const availabilities = await prisma.availability.findMany({
      where: {
        providerId,
        isActive: true,
      },
    });

    if (availabilities.length === 0) {
      return [];
    }

    // Busca agendamentos confirmados ou pendentes no período
    const appointments = await prisma.appointment.findMany({
      where: {
        providerId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    const slots: Array<{ date: string; time: string; available: boolean }> = [];
    const currentDate = new Date(startDate);

    // Itera por cada dia no período
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      // Encontra disponibilidades para este dia da semana
      const dayAvailabilities = availabilities.filter(
        (av) => av.dayOfWeek === dayOfWeek
      );

      for (const availability of dayAvailabilities) {
        // Verifica se está dentro do período de datas (se não for recorrente)
        if (!availability.isRecurring) {
          if (availability.startDate && currentDate < availability.startDate) {
            continue;
          }
          if (availability.endDate && currentDate > availability.endDate) {
            continue;
          }
        }

        // Gera slots para este dia
        const timeSlots = generateTimeSlots(
          availability.startTime,
          availability.endTime,
          availability.slotDuration,
          availability.bufferTime
        );

        // Verifica quais slots estão ocupados (usa data local para evitar timezone)
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        for (const timeSlot of timeSlots) {
          const slotDateTime = combineDateTime(currentDate, timeSlot);
          const slotEndDateTime = new Date(
            slotDateTime.getTime() + availability.slotDuration * 60000
          );

          // Verifica se há conflito com agendamentos existentes
          const hasConflict = appointments.some((apt) => {
            return (
              apt.startTime < slotEndDateTime &&
              new Date(apt.startTime.getTime() + apt.duration * 60000) > slotDateTime
            );
          });

          // Verifica se o slot não está no passado
          const isPast = slotDateTime < new Date();

          slots.push({
            date: dateStr,
            time: timeSlot,
            available: !hasConflict && !isPast,
          });
        }
      }

      // Avança para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Remove duplicatas (date + time) mantendo o primeiro de cada
    const seen = new Set<string>();
    return slots.filter((slot) => {
      const key = `${slot.date}-${slot.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export const availabilityService = new AvailabilityService();
