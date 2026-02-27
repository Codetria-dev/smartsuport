import { describe, it, expect } from 'vitest';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema,
} from './appointment.schema';

const validProviderId = 'clxx123abc'; // CUID (Prisma)
const validDatetime = '2025-06-15T14:00:00.000Z';

describe('appointment.schema', () => {
  describe('createAppointmentSchema', () => {
    it('aceita payload válido', () => {
      const result = createAppointmentSchema.safeParse({
        providerId: validProviderId,
        startTime: validDatetime,
        duration: 30,
      });
      expect(result.success).toBe(true);
    });

    it('aceita meetingLink vazio e transforma em undefined', () => {
      const result = createAppointmentSchema.safeParse({
        providerId: validProviderId,
        startTime: validDatetime,
        duration: 30,
        meetingLink: '',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.meetingLink).toBeUndefined();
      }
    });

    it('aceita meetingLink como URL válida', () => {
      const result = createAppointmentSchema.safeParse({
        providerId: validProviderId,
        startTime: validDatetime,
        duration: 30,
        meetingLink: 'https://meet.google.com/abc',
      });
      expect(result.success).toBe(true);
    });

    it('rejeita providerId vazio', () => {
      const result = createAppointmentSchema.safeParse({
        providerId: '',
        startTime: validDatetime,
        duration: 30,
      });
      expect(result.success).toBe(false);
    });

    it('rejeita duration fora do intervalo 5-480', () => {
      expect(createAppointmentSchema.safeParse({
        providerId: validProviderId,
        startTime: validDatetime,
        duration: 4,
      }).success).toBe(false);
      expect(createAppointmentSchema.safeParse({
        providerId: validProviderId,
        startTime: validDatetime,
        duration: 481,
      }).success).toBe(false);
    });
  });

  describe('updateAppointmentSchema', () => {
    it('aceita todos os campos opcionais', () => {
      const result = updateAppointmentSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('aceita status válido', () => {
      const result = updateAppointmentSchema.safeParse({
        status: 'CONFIRMED',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('cancelAppointmentSchema', () => {
    it('aceita reason opcional', () => {
      const result = cancelAppointmentSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
