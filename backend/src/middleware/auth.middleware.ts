import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona os dados do usuário em req.user
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header missing' });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({ error: 'Token missing' });
      return;
    }

    const payload = verifyAccessToken(token);

    // Adiciona dados do usuário na requisição
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        res.status(401).json({ error: 'Token expired' });
        return;
      }
      if (error.message === 'Invalid token') {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
    }
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware opcional de autenticação
 * Não retorna erro se não houver token, apenas adiciona req.user se existir
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    // Se o token for inválido, apenas continua sem req.user
    next();
  }
}

/**
 * Middleware para verificar roles específicas
 * Deve ser usado após authenticateToken
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware para verificar se o usuário é o dono do recurso ou admin
 */
export function requireOwnershipOrAdmin(
  getUserId: (req: Request) => string | undefined
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const resourceUserId = getUserId(req);

    if (
      req.user.role === 'ADMIN' ||
      (resourceUserId && req.user.userId === resourceUserId)
    ) {
      next();
      return;
    }

    res.status(403).json({ error: 'Access denied' });
  };
}
