import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { isEmailConfigured } from './services/emailService';

async function startServer() {
  try {
    // Testa conexão com o banco
    await prisma.$connect();
    console.log('Database connected');

    if (isEmailConfigured()) {
      console.log('Email (SMTP) configurado – reset de senha e confirmação de agendamento serão enviados');
    } else {
      console.log('Email não configurado – configure SMTP_* no .env para envio real (reset de senha, confirmação de agendamento)');
    }

    // Inicia o servidor
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`CORS enabled for: ${env.CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
