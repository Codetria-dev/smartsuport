import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(128),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  phone: z.string().max(20).optional(),
  role: z.enum(['ADMIN', 'PROVIDER', 'CLIENT']).default('CLIENT'),
});

/** Cadastro de cliente pelo profissional (painel) – sem role no body (sempre CLIENT) */
export const registerClientSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(128),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  phone: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100)
    .optional()
    .transform((v) => (v === '' || v == null ? undefined : v)),
  email: z
    .string()
    .email('Email inválido')
    .max(255)
    .optional()
    .transform((v) => (v === '' || v == null ? undefined : v)),
  phone: z
    .string()
    .max(20)
    .optional()
    .transform((v) => (v === '' || v == null ? undefined : v)),
  timezone: z.string().max(50).optional(),
  avatar: z
    .string()
    .optional()
    .transform((v) => (v === '' || v == null ? undefined : v))
    .pipe(z.string().url('URL inválida').optional()),
  profileDescription: z
    .string()
    .max(2000)
    .optional()
    .transform((v) => (v === '' || v == null ? undefined : v)),
  isProfileActive: z
    .boolean()
    .optional(),
});
