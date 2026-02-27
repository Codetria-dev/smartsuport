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
  jti?: string; // JWT ID – used for revocation in DB
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: jwtConfig.accessTokenExpiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, jwtConfig.secret, options);
}

/**
 * Generate JWT refresh token with jti (for DB revocation)
 */
export function generateRefreshToken(payload: RefreshTokenPayload, jti: string): string {
  const options: jwt.SignOptions = {
    expiresIn: jwtConfig.refreshTokenExpiresIn as jwt.SignOptions['expiresIn'],
    jwtid: jti,
  };
  return jwt.sign({ userId: payload.userId }, jwtConfig.secret, options);
}

/**
 * Verify and decode access token
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
 * Verify and decode refresh token
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
 * Decode token without verifying (debug only)
 */
export function decodeToken(token: string): jwt.JwtPayload | null {
  return jwt.decode(token) as jwt.JwtPayload | null;
}
