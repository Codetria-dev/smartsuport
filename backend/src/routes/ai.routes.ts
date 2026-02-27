import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

router.get('/config', aiController.getConfig);
router.put('/config', aiController.updateConfig);
router.post('/auto-response', aiController.generateAutoResponse);
router.post('/suggest-times', aiController.suggestOptimalTimes);
router.get('/webhook-logs', aiController.getWebhookLogs);

export default router;
