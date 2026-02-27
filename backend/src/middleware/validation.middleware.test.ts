import { describe, it, expect, vi } from 'vitest';
import { validate } from './validation.middleware';
import { z } from 'zod';

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0),
});

describe('validation.middleware', () => {
  it('chama next() quando body é válido e substitui req.body', () => {
    const middleware = validate(testSchema, 'body');
    const req: any = { body: { name: 'João', age: 25 } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'João', age: 25 });
  });

  it('responde 400 com detalhes quando body é inválido', () => {
    const middleware = validate(testSchema, 'body');
    const req: any = { body: { name: '', age: -1 } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation failed',
        details: expect.any(Array),
      })
    );
  });

  it('valida query quando source é query', () => {
    const querySchema = z.object({ page: z.coerce.number().min(1) });
    const middleware = validate(querySchema, 'query');
    const req: any = { query: { page: '1' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.query).toEqual({ page: 1 });
  });
});
