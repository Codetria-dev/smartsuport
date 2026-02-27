import { Router } from 'express';
import { billingController } from '../controllers/billingController';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Webhook está registrado em app.ts com body raw (POST /api/billing/webhook/stripe)

// Rotas protegidas
router.get('/subscription', authenticateToken, billingController.getSubscription);
router.post('/checkout', authenticateToken, billingController.createCheckoutSession);
router.post('/cancel', authenticateToken, billingController.cancelSubscription);

export default router;
