import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  registerSchema,
  registerClientSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../schemas/auth.schema';
import { requireRole } from '../middleware/auth.middleware';

const router = Router();

// Rotas públicas
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Cadastro de cliente pelo profissional (PROVIDER/ADMIN)
router.post(
  '/register-client',
  authenticateToken,
  requireRole('PROVIDER', 'ADMIN'),
  validate(registerClientSchema),
  authController.registerClient
);

// Rotas protegidas
router.get('/me', authenticateToken, authController.getProfile);
router.put('/me', authenticateToken, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticateToken, validate(changePasswordSchema), authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);

export default router;
