import { z } from 'zod';

const baseAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido. Use HH:mm'),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido. Use HH:mm'),
  isRecurring: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timezone: z.string().default('America/Sao_Paulo'),
  slotDuration: z.number().int().min(5).max(480).default(30),
  bufferTime: z.number().int().min(0).max(60).default(0),
  maxBookingsPerSlot: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
});

export const createAvailabilitySchema = baseAvailabilitySchema.refine((data) => {
  const start = parseInt(data.startTime.split(':')[0]) * 60 + parseInt(data.startTime.split(':')[1]);
  const end = parseInt(data.endTime.split(':')[0]) * 60 + parseInt(data.endTime.split(':')[1]);
  return end > start;
}, {
  message: 'endTime deve ser maior que startTime',
  path: ['endTime'],
});

export const updateAvailabilitySchema = baseAvailabilitySchema.partial();

export const getSlotsQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type GetSlotsInput = z.infer<typeof getSlotsQuerySchema>;
