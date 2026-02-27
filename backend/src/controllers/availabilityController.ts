import { Request, Response } from 'express';
import { availabilityService } from '../services/availabilityService';
import { asyncHandler } from '../middleware/error.middleware';

export const availabilityController = {
  /**
   * Lista disponibilidades do provider logado
   */
  getMyAvailabilities: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const availabilities = await availabilityService.getProviderAvailabilities(
      req.user.userId
    );

    res.json(availabilities);
  }),

  /**
   * Cria uma nova disponibilidade
   */
  createAvailability: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (req.user.role !== 'PROVIDER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Apenas providers podem criar disponibilidades' });
    }

    const availability = await availabilityService.createAvailability(
      req.user.userId,
      req.body
    );

    res.status(201).json(availability);
  }),

  /**
   * Atualiza uma disponibilidade
   */
  updateAvailability: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;
    const availability = await availabilityService.updateAvailability(
      id,
      req.user.userId,
      req.body
    );

    res.json(availability);
  }),

  /**
   * Deleta uma disponibilidade
   */
  deleteAvailability: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;
    await availabilityService.deleteAvailability(id, req.user.userId);

    res.status(204).send();
  }),

  /**
   * Obtém slots disponíveis de um provider (público - não requer autenticação)
   */
  getAvailableSlots: asyncHandler(async (req: Request, res: Response) => {
    const { providerId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate e endDate são obrigatórios',
      });
    }

    const slots = await availabilityService.getAvailableSlots(
      providerId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(slots);
  }),
};
