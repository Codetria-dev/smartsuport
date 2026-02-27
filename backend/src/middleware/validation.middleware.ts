import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error.middleware';

/**
 * Middleware de validação usando Zod
 * Valida o body, query ou params da requisição
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      const validated = schema.parse(data);
      req[source] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
        return;
      }
      next(error);
    }
  };
}
