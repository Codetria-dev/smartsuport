import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  FRONTEND_URL: string;
  // Stripe
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_SMART_PRICE_ID?: string;
  STRIPE_PRO_PRICE_ID?: string;
  // OpenAI
  OPENAI_API_KEY?: string;
  // Email
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_ACCESS_TOKEN_EXPIRES_IN',
    'JWT_REFRESH_TOKEN_EXPIRES_IN',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN!,
    JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN!,
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    // Stripe (opcional)
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_SMART_PRICE_ID: process.env.STRIPE_SMART_PRICE_ID,
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
    // OpenAI (opcional)
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    // Email (opcional)
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
  };
}

export const env = validateEnv();
