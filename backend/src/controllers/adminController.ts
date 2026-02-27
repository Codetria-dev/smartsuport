import { Request, Response } from 'express';
import { adminService } from '../services/adminService';
import { asyncHandler } from '../middleware/error.middleware';

export const adminController = {
  /**
   * Obtém estatísticas do dashboard
   */
  getDashboardStats: asyncHandler(async (req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  }),

  /**
   * Lista usuários
   */
  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      role: req.query.role as string | undefined,
      plan: req.query.plan as string | undefined,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    };

    const result = await adminService.listUsers(page, limit, filters);
    res.json(result);
  }),

  /**
   * Obtém detalhes de um usuário
   */
  getUserDetails: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await adminService.getUserDetails(userId);
    res.json(user);
  }),

  /**
   * Ativa/desativa usuário
   */
  toggleUserStatus: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { isActive } = req.body;
    const user = await adminService.toggleUserStatus(userId, isActive);
    res.json(user);
  }),

  /**
   * Atualiza plano do usuário
   */
  updateUserPlan: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { plan, status } = req.body;
    const user = await adminService.updateUserPlan(userId, plan, status);
    res.json(user);
  }),

  /**
   * Lista agendamentos
   */
  listAppointments: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      status: req.query.status as string | undefined,
      providerId: req.query.providerId as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };

    const result = await adminService.listAppointments(page, limit, filters);
    res.json(result);
  }),
};
