import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/hash.utils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { AppError } from '../middleware/error.middleware';
import { randomUUID } from 'crypto';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'ADMIN' | 'PROVIDER' | 'CLIENT';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    plan: string;
    planStatus: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Registra um novo usuário
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email já está em uso', 400);
    }

    // Hash da senha
    const hashedPassword = await hashPassword(data.password);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: data.role || 'CLIENT',
        plan: 'FREE',
        planStatus: 'ACTIVE',
        planStartDate: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        planStatus: true,
        createdAt: true,
      },
    });

    // Gera tokens (jti permite revogação no BD)
    const jti = randomUUID();
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'PROVIDER' | 'CLIENT',
    });
    const refreshToken = generateRefreshToken({ userId: user.id }, jti);

    await prisma.refreshToken.create({
      data: { userId: user.id, jti },
    });

    // Atualiza último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Envia email de boas-vindas (não bloqueia a resposta)
    import('./emailService').then(({ emailService }) => {
      emailService.sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) => {
        console.error('Erro ao enviar email de boas-vindas:', err);
      });
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        planStatus: user.planStatus,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Cadastra um novo cliente (chamado por PROVIDER ou ADMIN no painel).
   * Não retorna tokens; o cliente usa login depois.
   * Opcionalmente associa ao profissional que cadastrou (registeredByUserId).
   */
  async registerClient(
    data: Omit<RegisterInput, 'role'>,
    registeredByUserId?: string
  ): Promise<{ user: { id: string; email: string; name: string; role: string } }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email já está em uso', 400);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: 'CLIENT',
        plan: 'FREE',
        planStatus: 'ACTIVE',
        planStartDate: new Date(),
        registeredByUserId: registeredByUserId || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Faz login do usuário
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    // Verifica se o usuário está ativo
    if (!user.isActive) {
      throw new AppError('Conta desativada. Entre em contato com o suporte.', 403);
    }

    // Verifica a senha
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    // Gera tokens (jti permite revogação no BD)
    const jti = randomUUID();
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'PROVIDER' | 'CLIENT',
    });
    const refreshToken = generateRefreshToken({ userId: user.id }, jti);

    await prisma.refreshToken.create({
      data: { userId: user.id, jti },
    });

    // Atualiza último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        planStatus: user.planStatus,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Atualiza o access token usando refresh token (valida no BD: não revogado)
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload.jti) {
      throw new AppError('Token inválido', 401);
    }

    const record = await prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
      include: { user: { select: { id: true, email: true, role: true, isActive: true } } },
    });

    if (!record || record.revokedAt || !record.user.isActive) {
      throw new AppError('Token inválido ou revogado', 401);
    }

    const user = record.user;
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'PROVIDER' | 'CLIENT',
    });

    return { accessToken };
  }

  /**
   * Revoga um refresh token (logout)
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      if (!payload.jti) return;

      await prisma.refreshToken.updateMany({
        where: { jti: payload.jti },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Token inválido ou expirado – nada a revogar
    }
  }

  /**
   * Solicita reset de senha
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por segurança, não revela se o email existe ou não
      return;
    }

    // Gera token de reset
    const resetToken = randomUUID();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Expira em 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Envia email com link de reset
    try {
      const { emailService } = await import('./emailService');
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await emailService.sendPasswordReset({
          to: email,
          name: user.name,
          resetToken,
        });
      }
    } catch (error) {
      console.error('Erro ao enviar email de reset:', error);
      // Não falha o processo se o email não for enviado
    }
  }

  /**
   * Reseta a senha usando o token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Token inválido ou expirado', 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }

  /**
   * Altera a senha (usuário logado)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError('Senha atual incorreta', 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });
  }

  /**
   * Obtém perfil do usuário
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        timezone: true,
        avatar: true,
        plan: true,
        planStatus: true,
        planStartDate: true,
        planEndDate: true,
        isEmailVerified: true,
        profileDescription: true,
        isProfileActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return user;
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      timezone?: string;
      avatar?: string;
      profileDescription?: string;
      isProfileActive?: boolean;
    }
  ) {
    if (data.email !== undefined) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, id: { not: userId } },
      });
      if (existing) {
        throw new AppError('Email já está em uso', 400);
      }
    }

    const updateData: {
      name?: string;
      email?: string;
      phone?: string | null;
      timezone?: string;
      avatar?: string;
      profileDescription?: string | null;
      isProfileActive?: boolean;
      updatedAt: Date;
    } = { updatedAt: new Date() };
    if (data.name !== undefined && data.name !== '') updateData.name = data.name.trim();
    if (data.email !== undefined && data.email !== '') updateData.email = data.email.trim();
    if (data.phone !== undefined) updateData.phone = data.phone === '' || data.phone == null ? null : data.phone;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.profileDescription !== undefined) updateData.profileDescription = data.profileDescription === '' || data.profileDescription == null ? null : data.profileDescription;
    if (data.isProfileActive !== undefined) updateData.isProfileActive = data.isProfileActive;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        timezone: true,
        avatar: true,
        plan: true,
        planStatus: true,
        profileDescription: true,
        isProfileActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

export const authService = new AuthService();
