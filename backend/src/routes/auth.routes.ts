import { Router } from 'express';
import rateLimit from 'express-rate-limit';
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

// Rate limit rigoroso para rotas públicas de autenticação (10 tentativas/min)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de autenticação. Tente novamente em 1 minuto.' },
});

// Rotas públicas (com rate limit)
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

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
