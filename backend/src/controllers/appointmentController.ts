import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { appointmentService } from '../services/appointmentService';
import { asyncHandler } from '../middleware/error.middleware';

export const appointmentController = {
  /**
   * Lista agendamentos do usuário logado
   */
  getMyAppointments: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const appointments = await appointmentService.getUserAppointments(
      req.user.userId,
      req.user.role
    );

    res.json(appointments);
  }),

  /**
   * Obtém um agendamento por ID
   */
  getAppointmentById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(
      id,
      req.user.userId,
      req.user.role
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json(appointment);
  }),

  /**
   * Cria um novo agendamento
   */
  createAppointment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // PROVIDER/ADMIN podem passar clientId para agendar em nome do cliente
    const isProviderOrAdmin = req.user.role === 'PROVIDER' || req.user.role === 'ADMIN';
    const clientId = isProviderOrAdmin && req.body.clientId
      ? req.body.clientId
      : req.user.userId;

    const appointment = await appointmentService.createAppointment(
      clientId,
      req.body
    );

    res.status(201).json(appointment);
  }),

  /**
   * Confirma um agendamento (apenas provider)
   */
  confirmAppointment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (req.user.role !== 'PROVIDER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Apenas providers podem confirmar agendamentos' });
    }

    const { id } = req.params;
    const appointment = await appointmentService.confirmAppointment(
      id,
      req.user.userId
    );

    res.json(appointment);
  }),

  /**
   * Lista todos os providers (para clientes escolherem em select-provider).
   * Mostra quem tem role PROVIDER/ADMIN e está ativo (isActive).
   */
  getProviders: asyncHandler(async (_req: Request, res: Response) => {
    const providers = await prisma.user.findMany({
      where: {
        role: {
          in: ['PROVIDER', 'ADMIN'],
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        profileDescription: true,
      },
    });

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json(providers);
  }),

  /**
   * Cancela um agendamento
   */
  cancelAppointment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await appointmentService.cancelAppointment(
      id,
      req.user.userId,
      req.user.role,
      reason
    );

    res.json(appointment);
  }),

  /**
   * Atualiza um agendamento
   */
  updateAppointment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;
    const appointment = await appointmentService.updateAppointment(
      id,
      req.user.userId,
      req.user.role,
      req.body
    );

    res.json(appointment);
  }),

  /**
   * Cria um agendamento público (sem autenticação)
   */
  createPublicAppointment: asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.createPublicAppointment(req.body);
    res.status(201).json(appointment);
  }),

  /**
   * Obtém um agendamento pelo token público
   */
  getAppointmentByPublicToken: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const appointment = await appointmentService.getAppointmentByPublicToken(token);

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json(appointment);
  }),

  /**
   * Cancela um agendamento público pelo token
   */
  cancelPublicAppointment: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { reason } = req.body;
    const appointment = await appointmentService.cancelPublicAppointment(token, reason);
    res.json(appointment);
  }),
};
