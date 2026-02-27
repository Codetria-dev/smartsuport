import { Availability } from '@prisma/client';
import { CreateAvailabilityInput, UpdateAvailabilityInput } from '../schemas/availability.schema';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../config/database';

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
   * Garante que um provider tenha disponibilidade padrão (para testes/demo)
   * Cria Segunda a Sexta, 9h-18h, se não tiver nenhuma
   */
  private async ensureDefaultAvailabilityForProvider(
    providerId: string
  ): Promise<Availability[]> {
    const provider = await prisma.user.findUnique({
      where: { id: providerId, role: { in: ['PROVIDER', 'ADMIN'] } },
    });
    if (!provider) return [];

    const existing = await prisma.availability.findMany({
      where: { providerId },
    });
    if (existing.length > 0) return existing;

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
   */
  async getAvailableSlots(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ date: string; time: string; available: boolean }>> {
    // Garante que o provider tenha disponibilidade (cria padrão se não tiver)
    const availabilities = await this.ensureDefaultAvailabilityForProvider(providerId);

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
        const timeSlots = this.generateTimeSlots(
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
          const slotDateTime = this.combineDateTime(currentDate, timeSlot);
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

  /**
   * Gera slots de tempo
   */
  private generateTimeSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
    bufferTime: number
  ): string[] {
    const slots: string[] = [];
    let currentTime = startTime;

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    while (this.timeToMinutes(currentTime) + slotDuration <= endMinutes) {
      slots.push(currentTime);
      const nextSlot = this.timeToMinutes(currentTime) + slotDuration + bufferTime;
      currentTime = this.minutesToTime(nextSlot);
    }

    return slots;
  }

  /**
   * Converte HH:mm para minutos
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Converte minutos para HH:mm
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Combina data e hora
   */
  private combineDateTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }
}

export const availabilityService = new AvailabilityService();
