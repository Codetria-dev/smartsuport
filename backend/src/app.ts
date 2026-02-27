import express, { Express } from 'express';
import cors from 'cors';
import 'express-async-errors';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { stripeWebhookHandler } from './controllers/billingController';

const app: Express = express();

// Middlewares básicos
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// Webhook Stripe precisa do body raw para verificar assinatura (antes de express.json)
app.post(
  '/api/billing/webhook/stripe',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    stripeWebhookHandler(req, res).catch(next);
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Rotas da API
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import aiRoutes from './routes/ai.routes';
import billingRoutes from './routes/billing.routes';
import availabilityRoutes from './routes/availability.routes';
import appointmentRoutes from './routes/appointment.routes';
import clientsRoutes from './routes/clients.routes';

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clients', clientsRoutes);

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

export default app;
