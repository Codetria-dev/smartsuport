import { z } from 'zod';

export const createAppointmentSchema = z.object({
  providerId: z.string().min(1, 'ID do provider é obrigatório'), // CUID (Prisma)
  clientId: z.string().min(1).optional(), // Quando PROVIDER/ADMIN agenda para um cliente
  startTime: z.string().datetime(),
  duration: z.number().int().min(5).max(480), // 5 minutos a 8 horas
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

export const updateAppointmentSchema = z.object({
  startTime: z.string().datetime().optional(),
  duration: z.number().int().min(5).max(480).optional(),
  serviceType: z.string().max(100).optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  meetingLink: z
    .string()
    .optional()
    .transform((v) => (v === '' || v == null ? undefined : v))
    .pipe(z.string().url('URL inválida').optional()),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
