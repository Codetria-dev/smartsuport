import { z } from 'zod';

export const createPublicAppointmentSchema = z.object({
  providerId: z.string().min(1, 'ID do profissional é obrigatório'),
  startTime: z.string().datetime(),
  duration: z.number().int().min(5).max(480),
  
  // Dados do cliente (obrigatórios para público)
  clientName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  clientEmail: z.string().email('Email inválido').max(255),
  clientPhone: z.string().max(20).optional(),
  serviceType: z.string().max(100).optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  meetingLink: z
    .string()
    .optional()
    .transform((v) => (v === '' || v == null ? undefined : v))
    .pipe(z.string().url('URL inválida').optional()),
});

export type CreatePublicAppointmentInput = z.infer<typeof createPublicAppointmentSchema>;
