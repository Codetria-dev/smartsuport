import dotenv from 'dotenv';

dotenv.config();

function parseCorsOrigins(raw: string | undefined, fallback: string): string[] {
  const value = raw?.trim() || fallback;
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function stripTrailingSlash(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

/** Junta CORS_ORIGIN com FRONTEND_URL para não esquecer o domínio de produção no Railway. */
function buildCorsOrigins(): string[] {
  const fromList = parseCorsOrigins(
    process.env.CORS_ORIGIN,
    'http://localhost:5173'
  );
  const frontend = stripTrailingSlash(
    process.env.FRONTEND_URL || 'http://localhost:5173'
  );
  const productionVercel = 'https://smartsuport.vercel.app';
  const set = new Set<string>();
  for (const o of fromList) {
    set.add(stripTrailingSlash(o));
  }
  set.add(frontend);
  set.add(productionVercel);
  return [...set];
}

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;
  /** Origens permitidas no CORS (lista separada por vírgula no .env) */
  CORS_ORIGIN: string[];
  /** Se true, aceita qualquer subdomínio *.vercel.app (previews Vercel) */
  CORS_ALLOW_VERCEL_PREVIEWS: boolean;
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
  /** Se true, força TLS (secure: true). Se omitido, usa porta 465 como padrão TLS. */
  SMTP_SECURE?: boolean;
  // Encryption (para dados sensíveis no banco como apiKey do usuário)
  ENCRYPTION_KEY?: string;
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
    CORS_ORIGIN: buildCorsOrigins(),
    CORS_ALLOW_VERCEL_PREVIEWS:
      process.env.CORS_ALLOW_VERCEL_PREVIEWS === 'true' ||
      process.env.CORS_ALLOW_VERCEL_PREVIEWS === '1',
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
    SMTP_SECURE: process.env.SMTP_SECURE === 'true' ? true : process.env.SMTP_SECURE === 'false' ? false : undefined,
    // Encryption (opcional - para criptografar chaves de API no banco)
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  };
}

export const env = validateEnv();
