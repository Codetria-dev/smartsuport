import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { planService } from './planService';
import { encrypt, decrypt } from '../utils/crypto.utils';
import { env } from '../config/env';

export interface AIConfigInput {
  provider?: 'OPENAI' | 'ANTHROPIC' | 'GEMINI' | 'CUSTOM';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  autoResponder?: boolean;
  smartScheduling?: boolean;
  sentimentAnalysis?: boolean;
  autoReminders?: boolean;
  webhookUrl?: string;
  customPrompt?: string;
}

function maskApiKey(key: string | null): string | null {
  if (!key) return null;
  if (key.length <= 8) return '****';
  return key.slice(0, 4) + '****' + key.slice(-4);
}

export class AIService {
  /**
   * Obtém ou cria configuração de IA do usuário (apiKey mascarada no retorno)
   */
  async getOrCreateConfig(userId: string) {
    let config = await prisma.aIConfiguration.findUnique({
      where: { userId },
    });

    if (!config) {
      config = await prisma.aIConfiguration.create({
        data: {
          userId,
          provider: 'OPENAI',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 1000,
        },
      });
    }

    // Retorna apiKey mascarada (nunca expõe o valor real nem o ciphertext)
    return {
      ...config,
      apiKey: config.apiKey ? maskApiKey(this.decryptApiKey(config.apiKey)) : null,
    };
  }

  /**
   * Descriptografa a apiKey armazenada
   */
  private decryptApiKey(encryptedKey: string): string {
    try {
      return decrypt(encryptedKey);
    } catch {
      // Se não conseguir descriptografar (ex: KEY mudou), retorna o raw
      // para não quebrar a funcionalidade — mas loga o aviso
      console.warn('Aviso: não foi possível descriptografar a apiKey. Pode ser um valor legado ou ENCRYPTION_KEY foi alterada.');
      return encryptedKey;
    }
  }

  /**
   * Obtém a configuração com apiKey descriptografada (uso interno apenas)
   */
  private async getDecryptedConfig(userId: string) {
    const config = await prisma.aIConfiguration.findUnique({
      where: { userId },
    });

    if (!config) return null;

    return {
      ...config,
      apiKey: config.apiKey ? this.decryptApiKey(config.apiKey) : null,
    };
  }

  /**
   * Atualiza configuração de IA (apiKey é criptografada antes de salvar)
   */
  async updateConfig(userId: string, data: AIConfigInput) {
    // Verifica se o usuário tem plano PRO para usar features de IA
    const canUseAI = await planService.checkPlanLimit(userId, 'use_ai_feature');

    if (!canUseAI && (data.autoResponder || data.smartScheduling || data.sentimentAnalysis)) {
      throw new AppError(
        'Features de IA estão disponíveis apenas no plano PRO',
        403
      );
    }

    // Prepara dados para persistência — criptografa apiKey se fornecida
    const { apiKey, ...rest } = data;
    const updateData: any = { ...rest, updatedAt: new Date() };

    if (apiKey !== undefined) {
      if (apiKey === '') {
        updateData.apiKey = null; // Usuário quer remover a chave
      } else if (!env.ENCRYPTION_KEY) {
        throw new AppError(
          'ENCRYPTION_KEY não configurada no servidor. Contate o administrador.',
          500
        );
      } else {
        updateData.apiKey = encrypt(apiKey);
      }
    }

    const config = await prisma.aIConfiguration.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        provider: rest.provider || 'OPENAI',
        model: rest.model || 'gpt-4',
        temperature: rest.temperature ?? 0.7,
        maxTokens: rest.maxTokens ?? 1000,
        autoResponder: rest.autoResponder ?? false,
        smartScheduling: rest.smartScheduling ?? false,
        sentimentAnalysis: rest.sentimentAnalysis ?? false,
        autoReminders: rest.autoReminders ?? false,
        webhookUrl: rest.webhookUrl,
        customPrompt: rest.customPrompt,
        apiKey: apiKey && env.ENCRYPTION_KEY ? encrypt(apiKey) : null,
      },
    });

    return {
      ...config,
      apiKey: config.apiKey ? maskApiKey(this.decryptApiKey(config.apiKey)) : null,
    };
  }

  /**
   * Gera resposta automática usando IA
   */
  async generateAutoResponse(
    userId: string,
    context: {
      appointmentId: string;
      clientName: string;
      appointmentDate: string;
      message?: string;
    }
  ): Promise<string> {
    const config = await this.getOrCreateConfig(userId);

    if (!config.isActive || !config.autoResponder) {
      throw new AppError('Auto responder não está habilitado', 400);
    }

    // Usa OpenAI se configurado
    if (config.provider === 'OPENAI') {
      const decrypted = await this.getDecryptedConfig(userId);
      const { openaiService } = await import('./openaiService');
      return openaiService.generateAutoResponse({
        ...context,
        customPrompt: config.customPrompt || undefined,
        apiKey: decrypted?.apiKey || undefined,
      });
    }

    // Fallback para resposta básica
    return `Olá ${context.clientName}! Confirmamos seu agendamento para ${context.appointmentDate}. Estamos ansiosos para atendê-lo!`;
  }

  /**
   * Sugere horários usando IA
   */
  async suggestOptimalTimes(
    userId: string,
    preferences: {
      dateRange: { start: Date; end: Date };
      duration: number;
      preferredTimes?: string[];
    }
  ): Promise<string[]> {
    const config = await this.getOrCreateConfig(userId);

    if (!config.isActive || !config.smartScheduling) {
      throw new AppError('Smart scheduling não está habilitado', 400);
    }

    // Usa OpenAI se configurado
    if (config.provider === 'OPENAI') {
      const decrypted = await this.getDecryptedConfig(userId);
      const { openaiService } = await import('./openaiService');
      return openaiService.suggestOptimalTimes({
        ...preferences,
        apiKey: decrypted?.apiKey || undefined,
      });
    }

    // Fallback para horários básicos
    return ['09:00', '10:00', '14:00', '15:00'];
  }

  /**
   * Registra log de webhook
   */
  async logWebhook(
    userId: string | null,
    event: string,
    payload: any,
    status: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING'
  ) {
    return prisma.webhookLog.create({
      data: {
        userId,
        event,
        payload: JSON.stringify(payload),
        status,
      },
    });
  }

  /**
   * Lista logs de webhook
   */
  async getWebhookLogs(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.webhookLog.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.webhookLog.count({ where: { userId } }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const aiService = new AIService();
