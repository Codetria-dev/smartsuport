import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { clientController } from '../controllers/clientController';

const router = Router();

router.get(
  '/',
  authenticateToken,
  requireRole('PROVIDER', 'ADMIN'),
  clientController.list
);

router.get(
  '/:id',
  authenticateToken,
  requireRole('PROVIDER', 'ADMIN'),
  clientController.getById
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('PROVIDER', 'ADMIN'),
  clientController.remove
);

export default router;
