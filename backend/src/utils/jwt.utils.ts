import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

export type UserRole = 'ADMIN' | 'PROVIDER' | 'CLIENT';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  userId: string;
  jti?: string;  // JWT ID – usado para revogação no BD
}

/**
 * Gera um access token JWT
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.accessTokenExpiresIn,
  });
}

/**
 * Gera um refresh token JWT com jti (para revogação no BD)
 */
export function generateRefreshToken(payload: RefreshTokenPayload, jti: string): string {
  return jwt.sign(
    { userId: payload.userId },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.refreshTokenExpiresIn,
      jwtid: jti,
    }
  );
}

/**
 * Verifica e decodifica um access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, jwtConfig.secret) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Verifica e decodifica um refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, jwtConfig.secret) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Decodifica um token sem verificar (útil para debug)
 */
export function decodeToken(token: string): jwt.JwtPayload | null {
  return jwt.decode(token) as jwt.JwtPayload | null;
}
