import { describe, it, expect } from 'vitest';
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
  getSlotsQuerySchema,
} from './availability.schema';

describe('availability.schema', () => {
  describe('createAvailabilitySchema', () => {
    it('aceita payload válido com endTime > startTime', () => {
      const result = createAvailabilitySchema.safeParse({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '18:00',
      });
      expect(result.success).toBe(true);
    });

    it('rejeita quando endTime <= startTime', () => {
      const result = createAvailabilitySchema.safeParse({
        dayOfWeek: 1,
        startTime: '18:00',
        endTime: '09:00',
      });
      expect(result.success).toBe(false);
    });

    it('rejeita formato de horário inválido', () => {
      const result = createAvailabilitySchema.safeParse({
        dayOfWeek: 1,
        startTime: '9:00',
        endTime: '18:00',
      });
      expect(result.success).toBe(false);
    });

    it('rejeita dayOfWeek fora de 0-6', () => {
      const result = createAvailabilitySchema.safeParse({
        dayOfWeek: 7,
        startTime: '09:00',
        endTime: '18:00',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateAvailabilitySchema', () => {
    it('aceita partial', () => {
      const result = updateAvailabilitySchema.safeParse({
        isActive: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getSlotsQuerySchema', () => {
    it('aceita startDate e endDate em formato datetime', () => {
      const result = getSlotsQuerySchema.safeParse({
        startDate: '2025-06-01T00:00:00.000Z',
        endDate: '2025-06-30T23:59:59.000Z',
      });
      expect(result.success).toBe(true);
    });
  });
});
