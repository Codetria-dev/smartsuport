import { Router } from 'express';
import { appointmentController } from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema,
} from '../schemas/appointment.schema';
import { createPublicAppointmentSchema } from '../schemas/publicAppointment.schema';

const router = Router();

// ============================================
// ROTAS PÚBLICAS (sem autenticação)
// ============================================

// Lista providers disponíveis (público)
router.get('/public/providers', appointmentController.getProviders);

// Cria agendamento público (sem login)
router.post(
  '/public/book',
  validate(createPublicAppointmentSchema),
  appointmentController.createPublicAppointment
);

// Obtém agendamento pelo token público
router.get('/public/appointment/:token', appointmentController.getAppointmentByPublicToken);

// Cancela agendamento público pelo token
router.put(
  '/public/appointment/:token/cancel',
  validate(cancelAppointmentSchema),
  appointmentController.cancelPublicAppointment
);

// ============================================
// ROTAS PRIVADAS (com autenticação)
// ============================================

// Todas as rotas abaixo requerem autenticação
router.use(authenticateToken);

// Lista providers disponíveis (também disponível para autenticados)
router.get('/providers', appointmentController.getProviders);

// Lista agendamentos do usuário logado
router.get('/me', appointmentController.getMyAppointments);

// Obtém um agendamento por ID
router.get('/:id', appointmentController.getAppointmentById);

// Cria um novo agendamento
router.post(
  '/',
  validate(createAppointmentSchema),
  appointmentController.createAppointment
);

// Confirma um agendamento (apenas provider)
router.put('/:id/confirm', appointmentController.confirmAppointment);

// Cancela um agendamento
router.put(
  '/:id/cancel',
  validate(cancelAppointmentSchema),
  appointmentController.cancelAppointment
);

// Atualiza um agendamento
router.put(
  '/:id',
  validate(updateAppointmentSchema),
  appointmentController.updateAppointment
);

export default router;
