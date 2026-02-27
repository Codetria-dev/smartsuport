import { env } from './env';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  accessTokenExpiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN,
} as const;
