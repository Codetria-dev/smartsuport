import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Middleware de tratamento de erros
 * Deve ser o último middleware na cadeia
 */
export function errorHandler(
  err: AppError | SyntaxError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Trata erros de parsing JSON
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('JSON Parse Error:', {
      message: err.message,
      path: req.path,
      method: req.method,
      body: req.body,
    });

    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'O corpo da requisição contém JSON inválido',
      details: err.message,
    });
  }

  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log do erro
  console.error('Error:', {
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    statusCode,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    error: message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Classe de erro customizada
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wrapper para async functions que captura erros automaticamente
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
