import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from './auth.schema';

describe('auth.schema', () => {
  describe('registerSchema', () => {
    it('aceita dados válidos', () => {
      const result = registerSchema.safeParse({
        email: 'teste@email.com',
        password: '123456',
        name: 'João Silva',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('CLIENT');
      }
    });

    it('aceita phone opcional', () => {
      const result = registerSchema.safeParse({
        email: 'a@b.com',
        password: '123456',
        name: 'Jo',
        phone: '11999999999',
      });
      expect(result.success).toBe(true);
    });

    it('rejeita email inválido', () => {
      const result = registerSchema.safeParse({
        email: 'invalido',
        password: '123456',
        name: 'João',
      });
      expect(result.success).toBe(false);
    });

    it('rejeita senha curta', () => {
      const result = registerSchema.safeParse({
        email: 'a@b.com',
        password: '12345',
        name: 'João',
      });
      expect(result.success).toBe(false);
    });

    it('rejeita nome com menos de 2 caracteres', () => {
      const result = registerSchema.safeParse({
        email: 'a@b.com',
        password: '123456',
        name: 'J',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('aceita email e senha válidos', () => {
      const result = loginSchema.safeParse({
        email: 'user@email.com',
        password: 'qualquersenha',
      });
      expect(result.success).toBe(true);
    });

    it('rejeita senha vazia', () => {
      const result = loginSchema.safeParse({
        email: 'user@email.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('aceita email válido', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'user@email.com' });
      expect(result.success).toBe(true);
    });
  });

  describe('resetPasswordSchema', () => {
    it('aceita token e senha válida', () => {
      const result = resetPasswordSchema.safeParse({
        token: 'abc123',
        password: 'novaSenha123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('changePasswordSchema', () => {
    it('aceita senha atual e nova', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'antiga',
        newPassword: 'nova123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateProfileSchema', () => {
    it('aceita todos os campos opcionais', () => {
      const result = updateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('aceita avatar como string vazia e transforma em undefined', () => {
      const result = updateProfileSchema.safeParse({ avatar: '' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.avatar).toBeUndefined();
      }
    });

    it('aceita avatar como URL válida', () => {
      const result = updateProfileSchema.safeParse({
        avatar: 'https://example.com/avatar.png',
      });
      expect(result.success).toBe(true);
    });

    it('rejeita avatar com URL inválida', () => {
      const result = updateProfileSchema.safeParse({
        avatar: 'não-é-url',
      });
      expect(result.success).toBe(false);
    });
  });
});
