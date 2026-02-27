import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class AdminService {
  /**
   * Obtém estatísticas gerais do sistema
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalProviders,
      totalAppointments,
      activeAppointments,
      freeUsers,
      proUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PROVIDER' } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: { in: ['PENDING', 'CONFIRMED'] } } }),
      prisma.user.count({ where: { plan: 'FREE' } }),
      prisma.user.count({ where: { plan: 'PRO' } }),
    ]);

    // Agendamentos por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const appointmentsByMonth = await prisma.appointment.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    });

    return {
      users: {
        total: totalUsers,
        providers: totalProviders,
        free: freeUsers,
        pro: proUsers,
      },
      appointments: {
        total: totalAppointments,
        active: activeAppointments,
        byMonth: appointmentsByMonth,
      },
    };
  }

  /**
   * Lista todos os usuários (com paginação)
   */
  async listUsers(page: number = 1, limit: number = 20, filters?: {
    role?: string;
    plan?: string;
    isActive?: boolean;
  }) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.plan) where.plan = filters.plan;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          planStatus: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtém detalhes de um usuário
   */
  async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        plan: true,
        planStatus: true,
        planStartDate: true,
        planEndDate: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        _count: {
          select: {
            appointmentsAsProvider: true,
            appointmentsAsClient: true,
            availabilities: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return user;
  }

  /**
   * Ativa/desativa um usuário
   */
  async toggleUserStatus(userId: string, isActive: boolean) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    return user;
  }

  /**
   * Atualiza o plano de um usuário manualmente
   */
  async updateUserPlan(userId: string, plan: 'FREE' | 'PRO', status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED') {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        planStatus: status,
        planStartDate: status === 'ACTIVE' ? new Date() : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        planStatus: true,
      },
    });

    return user;
  }

  /**
   * Lista todos os agendamentos (com filtros)
   */
  async listAppointments(page: number = 1, limit: number = 20, filters?: {
    status?: string;
    providerId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.providerId) where.providerId = filters.providerId;
    if (filters?.startDate || filters?.endDate) {
      where.startTime = {};
      if (filters.startDate) where.startTime.gte = filters.startDate;
      if (filters.endDate) where.startTime.lte = filters.endDate;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: {
          startTime: 'desc',
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const adminService = new AdminService();
