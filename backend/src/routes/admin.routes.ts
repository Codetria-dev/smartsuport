import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação e role ADMIN
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/users', adminController.listUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId/status', adminController.toggleUserStatus);
router.put('/users/:userId/plan', adminController.updateUserPlan);
router.get('/appointments', adminController.listAppointments);

export default router;
