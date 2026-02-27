import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { getClients, getClientById, deleteClient } from '../services/clientService';

export const clientController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }
    const clients = await getClients(req.user.userId, req.user.role);
    res.json(clients);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }
    const client = await getClientById(req.params.id, req.user.userId, req.user.role);
    if (!client) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }
    res.json(client);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }
    await deleteClient(req.params.id, req.user.userId, req.user.role);
    res.status(204).send();
  }),
};
