import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { asyncHandler } from '../middleware/error.middleware';

export const authController = {
  /**
   * Registra um novo usuário
   */
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  }),

  /**
   * Cadastra um novo cliente (apenas PROVIDER ou ADMIN)
   */
  registerClient: asyncHandler(async (req: Request, res: Response) => {
    const registeredByUserId = req.user?.userId;
    const result = await authService.registerClient(req.body, registeredByUserId);
    res.status(201).json(result);
  }),

  /**
   * Faz login
   */
  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json(result);
  }),

  /**
   * Atualiza access token usando refresh token
   */
  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  }),

  /**
   * Solicita reset de senha
   */
  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({ message: 'Se o email existir, você receberá instruções para resetar sua senha' });
  }),

  /**
   * Reseta a senha usando token
   */
  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.json({ message: 'Senha resetada com sucesso' });
  }),

  /**
   * Altera senha (usuário logado)
   */
  changePassword: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    res.json({ message: 'Senha alterada com sucesso' });
  }),

  /**
   * Obtém perfil do usuário logado
   */
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const profile = await authService.getProfile(req.user.userId);
    res.json(profile);
  }),

  /**
   * Atualiza perfil do usuário logado
   */
  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const profile = await authService.updateProfile(req.user.userId, req.body);
    res.json(profile);
  }),

  /**
   * Logout: revoga o refresh token no BD (envie refreshToken no body para invalidar)
   */
  logout: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body?.refreshToken;
    if (refreshToken) {
      await authService.revokeRefreshToken(refreshToken);
    }
    return res.json({ message: 'Logout realizado com sucesso' });
  }),
};
