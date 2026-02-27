import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { asyncHandler } from '../middleware/error.middleware';

export const aiController = {
  /**
   * Obtém configuração de IA
   */
  getConfig: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const config = await aiService.getOrCreateConfig(req.user.userId);
    res.json(config);
  }),

  /**
   * Atualiza configuração de IA
   */
  updateConfig: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const config = await aiService.updateConfig(req.user.userId, req.body);
    res.json(config);
  }),

  /**
   * Gera resposta automática
   */
  generateAutoResponse: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const response = await aiService.generateAutoResponse(req.user.userId, req.body);
    res.json({ response });
  }),

  /**
   * Sugere horários otimizados
   */
  suggestOptimalTimes: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const times = await aiService.suggestOptimalTimes(req.user.userId, req.body);
    res.json({ times });
  }),

  /**
   * Lista logs de webhook
   */
  getWebhookLogs: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await aiService.getWebhookLogs(req.user.userId, page, limit);
    res.json(result);
  }),
};
