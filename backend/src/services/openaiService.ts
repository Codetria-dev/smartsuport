import OpenAI from 'openai';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';

// Inicializa OpenAI apenas se a chave estiver configurada
let openai: OpenAI | null = null;

if (env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}

export class OpenAIService {
  /**
   * Gera resposta automática usando GPT
   */
  async generateAutoResponse(context: {
    appointmentId: string;
    clientName: string;
    appointmentDate: string;
    message?: string;
    customPrompt?: string;
  }): Promise<string> {
    if (!openai) {
      // Se OpenAI não estiver configurado, retorna resposta básica
      return `Olá ${context.clientName}! Confirmamos seu agendamento para ${context.appointmentDate}. Estamos ansiosos para atendê-lo!`;
    }

    try {
      const prompt = context.customPrompt || `Você é um assistente de agendamento profissional e amigável.
Gere uma resposta automática para confirmar um agendamento.

Cliente: ${context.clientName}
Data: ${context.appointmentDate}
${context.message ? `Mensagem do cliente: ${context.message}` : ''}

Gere uma resposta profissional, amigável e concisa em português brasileiro.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente de agendamento profissional.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Erro ao gerar resposta';
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new AppError('Erro ao gerar resposta com IA', 500);
    }
  }

  /**
   * Sugere horários otimizados usando IA
   */
  async suggestOptimalTimes(preferences: {
    dateRange: { start: Date; end: Date };
    duration: number;
    preferredTimes?: string[];
    existingAppointments?: Array<{ start: Date; end: Date }>;
  }): Promise<string[]> {
    if (!openai) {
      // Se OpenAI não estiver configurado, retorna horários básicos
      return ['09:00', '10:00', '14:00', '15:00'];
    }

    try {
      const prompt = `Analise as preferências de agendamento e sugira os melhores horários disponíveis.

Período: ${preferences.dateRange.start.toLocaleDateString('pt-BR')} até ${preferences.dateRange.end.toLocaleDateString('pt-BR')}
Duração: ${preferences.duration} minutos
${preferences.preferredTimes ? `Horários preferidos: ${preferences.preferredTimes.join(', ')}` : ''}
${preferences.existingAppointments ? `Agendamentos existentes: ${preferences.existingAppointments.length}` : ''}

Sugira 4-6 horários ideais no formato HH:MM, um por linha.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em otimização de horários.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.5,
      });

      const response = completion.choices[0]?.message?.content || '';
      // Extrai horários do formato HH:MM
      const times = response
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /^\d{2}:\d{2}$/.test(line))
        .slice(0, 6);

      return times.length > 0 ? times : ['09:00', '10:00', '14:00', '15:00'];
    } catch (error) {
      console.error('OpenAI Error:', error);
      return ['09:00', '10:00', '14:00', '15:00'];
    }
  }

  /**
   * Analisa sentimento de uma mensagem
   */
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
  }> {
    if (!openai) {
      return { sentiment: 'neutral', score: 0.5 };
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um analisador de sentimento. Responda apenas com JSON: {"sentiment": "positive|neutral|negative", "score": 0.0-1.0}',
          },
          {
            role: 'user',
            content: `Analise o sentimento desta mensagem: "${text}"`,
          },
        ],
        max_tokens: 50,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content || '{"sentiment":"neutral","score":0.5}';
      return JSON.parse(response);
    } catch (error) {
      console.error('OpenAI Error:', error);
      return { sentiment: 'neutral', score: 0.5 };
    }
  }
}

export const openaiService = new OpenAIService();
