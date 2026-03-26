import type { CorsOptions } from 'cors';
import { env } from './env';

/** Remove espaços e barra final — evita falha quando o .env tem ou não tem "/" no fim */
export function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

const VERCEL_PREVIEW = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

function isOriginAllowed(requestOrigin: string): boolean {
  const n = normalizeOrigin(requestOrigin);
  const allowed = env.CORS_ORIGIN.map(normalizeOrigin);
  if (allowed.includes(n)) {
    return true;
  }
  if (env.CORS_ALLOW_VERCEL_PREVIEWS && VERCEL_PREVIEW.test(n)) {
    return true;
  }
  return false;
}

/**
 * CORS para browser (login/registo com credentials).
 * Deve ser o primeiro middleware em app.ts (antes de rotas e body parsers).
 */
export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Sem header Origin: ferramentas, same-origin, alguns proxies
    if (!origin) {
      return callback(null, true);
    }
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] origem bloqueada: ${origin} | permitidas: ${env.CORS_ORIGIN.join(', ')}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: [],
  optionsSuccessStatus: 204,
  maxAge: 86400,
};
