import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { planService } from './planService';

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

export class AIService {
  /**
   * Obtém ou cria configuração de IA do usuário
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

    return config;
  }

  /**
   * Atualiza configuração de IA
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

    const config = await prisma.aIConfiguration.upsert({
      where: { userId },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        userId,
        provider: data.provider || 'OPENAI',
        model: data.model || 'gpt-4',
        temperature: data.temperature ?? 0.7,
        maxTokens: data.maxTokens ?? 1000,
        autoResponder: data.autoResponder ?? false,
        smartScheduling: data.smartScheduling ?? false,
        sentimentAnalysis: data.sentimentAnalysis ?? false,
        autoReminders: data.autoReminders ?? false,
        webhookUrl: data.webhookUrl,
        customPrompt: data.customPrompt,
      },
    });

    return config;
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
    if (config.provider === 'OPENAI' && config.apiKey) {
      const { openaiService } = await import('./openaiService');
      return openaiService.generateAutoResponse({
        ...context,
        customPrompt: config.customPrompt || undefined,
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
    if (config.provider === 'OPENAI' && config.apiKey) {
      const { openaiService } = await import('./openaiService');
      return openaiService.suggestOptimalTimes(preferences);
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
