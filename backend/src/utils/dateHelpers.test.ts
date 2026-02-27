import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  minutesToTime,
  addMinutes,
  isTimeBetween,
  generateTimeSlots,
  getDayOfWeek,
  hasOverlap,
  combineDateTime,
  formatDateISO,
} from './dateHelpers';

describe('dateHelpers', () => {
  describe('timeToMinutes', () => {
    it('converte HH:mm para minutos', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('09:30')).toBe(9 * 60 + 30);
      expect(timeToMinutes('23:59')).toBe(23 * 60 + 59);
    });
  });

  describe('minutesToTime', () => {
    it('converte minutos para HH:mm', () => {
      expect(minutesToTime(0)).toBe('00:00');
      expect(minutesToTime(570)).toBe('09:30');
      expect(minutesToTime(90)).toBe('01:30');
    });
  });

  describe('addMinutes', () => {
    it('adiciona minutos ao horário', () => {
      expect(addMinutes('09:00', 30)).toBe('09:30');
      expect(addMinutes('09:50', 20)).toBe('10:10');
    });
  });

  describe('isTimeBetween', () => {
    it('retorna true quando horário está no intervalo', () => {
      expect(isTimeBetween('10:00', '09:00', '18:00')).toBe(true);
      expect(isTimeBetween('09:00', '09:00', '18:00')).toBe(true);
      expect(isTimeBetween('18:00', '09:00', '18:00')).toBe(true);
    });

    it('retorna false quando horário está fora', () => {
      expect(isTimeBetween('08:00', '09:00', '18:00')).toBe(false);
      expect(isTimeBetween('19:00', '09:00', '18:00')).toBe(false);
    });
  });

  describe('generateTimeSlots', () => {
    it('gera slots com duração e buffer', () => {
      const slots = generateTimeSlots('09:00', '12:00', 60, 0);
      expect(slots).toEqual(['09:00', '10:00', '11:00']);
    });

    it('respeita buffer entre slots', () => {
      const slots = generateTimeSlots('09:00', '11:00', 30, 15);
      expect(slots[0]).toBe('09:00');
      expect(slots[1]).toBe('09:45');
    });
  });

  describe('getDayOfWeek', () => {
    it('retorna número de 0 a 6 (0=Domingo, 6=Sábado)', () => {
      const d = new Date('2025-06-15');
      const day = getDayOfWeek(d);
      expect(day).toBeGreaterThanOrEqual(0);
      expect(day).toBeLessThanOrEqual(6);
    });

    it('retorna 0 para domingo e 6 para sábado em data conhecida (local)', () => {
      // Date(ano, mês 0-indexed, dia) = data em horário local
      const domingo = new Date(2025, 5, 15); // 15 jun 2025 = domingo
      expect(getDayOfWeek(domingo)).toBe(0);
      const sabado = new Date(2025, 5, 14); // 14 jun 2025 = sábado
      expect(getDayOfWeek(sabado)).toBe(6);
    });
  });

  describe('hasOverlap', () => {
    it('detecta sobreposição', () => {
      const start1 = new Date('2025-06-01T09:00:00');
      const end1 = new Date('2025-06-01T10:00:00');
      const start2 = new Date('2025-06-01T09:30:00');
      const end2 = new Date('2025-06-01T10:30:00');
      expect(hasOverlap(start1, end1, start2, end2)).toBe(true);
    });

    it('retorna false quando não há sobreposição (horários adjacentes)', () => {
      const start1 = new Date('2025-06-01T09:00:00');
      const end1 = new Date('2025-06-01T10:00:00');
      const start2 = new Date('2025-06-01T10:00:00');
      const end2 = new Date('2025-06-01T11:00:00');
      expect(hasOverlap(start1, end1, start2, end2)).toBe(false);
    });

    it('detecta quando um intervalo contém o outro', () => {
      const start1 = new Date('2025-06-01T09:00:00');
      const end1 = new Date('2025-06-01T12:00:00');
      const start2 = new Date('2025-06-01T10:00:00');
      const end2 = new Date('2025-06-01T11:00:00');
      expect(hasOverlap(start1, end1, start2, end2)).toBe(true);
    });

    it('detecta quando o segundo começa antes do primeiro terminar (borda de dia)', () => {
      const start1 = new Date('2025-06-01T09:00:00');
      const end1 = new Date('2025-06-01T10:00:00');
      const start2 = new Date('2025-06-01T09:00:00');
      const end2 = new Date('2025-06-01T09:30:00');
      expect(hasOverlap(start1, end1, start2, end2)).toBe(true);
    });

    it('retorna false quando o segundo começa após o primeiro terminar', () => {
      const start1 = new Date('2025-06-01T09:00:00');
      const end1 = new Date('2025-06-01T10:00:00');
      const start2 = new Date('2025-06-01T10:30:00');
      const end2 = new Date('2025-06-01T11:00:00');
      expect(hasOverlap(start1, end1, start2, end2)).toBe(false);
    });
  });

  describe('combineDateTime', () => {
    it('combina data e hora HH:mm', () => {
      const date = new Date('2025-06-01');
      date.setHours(0, 0, 0, 0);
      const result = combineDateTime(date, '14:30');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(0);
    });

    it('meia-noite', () => {
      const date = new Date('2025-06-01');
      date.setHours(0, 0, 0, 0);
      const result = combineDateTime(date, '00:00');
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });
  });

  describe('formatDateISO', () => {
    it('formata data para string ISO', () => {
      const date = new Date('2025-06-01T12:00:00.000Z');
      const iso = formatDateISO(date);
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
