import { Router } from 'express';
import { availabilityController } from '../controllers/availabilityController';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
  getSlotsQuerySchema,
} from '../schemas/availability.schema';

const router = Router();

// Rota pública (SEM autenticação) - deve vir ANTES do authenticateToken
router.get(
  '/public/:providerId/slots',
  validate(getSlotsQuerySchema, 'query'),
  availabilityController.getAvailableSlots
);

// Todas as rotas abaixo requerem autenticação
router.use(authenticateToken);

// Lista disponibilidades do provider logado
router.get('/me', availabilityController.getMyAvailabilities);

// Cria disponibilidade (apenas providers)
router.post(
  '/',
  requireRole('PROVIDER', 'ADMIN'),
  validate(createAvailabilitySchema),
  availabilityController.createAvailability
);

// Atualiza disponibilidade
router.put(
  '/:id',
  requireRole('PROVIDER', 'ADMIN'),
  validate(updateAvailabilitySchema),
  availabilityController.updateAvailability
);

// Deleta disponibilidade
router.delete(
  '/:id',
  requireRole('PROVIDER', 'ADMIN'),
  availabilityController.deleteAvailability
);

// Obtém slots disponíveis (para usuários autenticados)
router.get(
  '/:providerId/slots',
  validate(getSlotsQuerySchema, 'query'),
  availabilityController.getAvailableSlots
);

export default router;
