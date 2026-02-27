import { describe, it, expect } from 'vitest';
import { createPublicAppointmentSchema } from './publicAppointment.schema';

describe('createPublicAppointmentSchema', () => {
  const validBase = {
    providerId: 'clxx123abc',
    startTime: '2025-06-15T14:00:00.000Z',
    duration: 30,
    clientName: 'Maria Silva',
    clientEmail: 'maria@example.com',
  };

  it('aceita payload válido mínimo', () => {
    const result = createPublicAppointmentSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.clientName).toBe('Maria Silva');
      expect(result.data.duration).toBe(30);
    }
  });

  it('aceita payload com campos opcionais', () => {
    const result = createPublicAppointmentSchema.safeParse({
      ...validBase,
      clientPhone: '11999999999',
      serviceType: 'Consulta',
      title: 'Primeira consulta',
      location: 'Rua X, 1',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita providerId vazio', () => {
    const result = createPublicAppointmentSchema.safeParse({
      ...validBase,
      providerId: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita duration menor que 5', () => {
    const result = createPublicAppointmentSchema.safeParse({
      ...validBase,
      duration: 4,
    });
    expect(result.success).toBe(false);
  });

  it('rejeita duration maior que 480', () => {
    const result = createPublicAppointmentSchema.safeParse({
      ...validBase,
      duration: 481,
    });
    expect(result.success).toBe(false);
  });

  it('aceita duration 5 e 480 (limites)', () => {
    expect(createPublicAppointmentSchema.safeParse({ ...validBase, duration: 5 }).success).toBe(true);
    expect(createPublicAppointmentSchema.safeParse({ ...validBase, duration: 480 }).success).toBe(true);
  });

  it('rejeita clientName curto', () => {
    const result = createPublicAppointmentSchema.safeParse({
      ...validBase,
      clientName: 'A',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita clientEmail inválido', () => {
    const result = createPublicAppointmentSchema.safeParse({
      ...validBase,
      clientEmail: 'nao-e-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita startTime que não é datetime ISO', () => {
    const result = createPublicAppointmentSchema.safeParse({
      ...validBase,
      startTime: '15/06/2025 14:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita meetingLink inválida quando fornecida', () => {
    const result = createPublicAppointmentSchema.safeParse({
      ...validBase,
      meetingLink: 'nao-e-url',
    });
    expect(result.success).toBe(false);
  });

  it('aceita meetingLink válida', () => {
    const result = createPublicAppointmentSchema.safeParse({
      ...validBase,
      meetingLink: 'https://meet.example.com/abc',
    });
    expect(result.success).toBe(true);
  });
});
