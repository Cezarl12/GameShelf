import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.error,
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const message = firstIssue
      ? firstIssue.message
      : 'Datele trimise sunt invalide';
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message,
    });
    return;
  }

  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'A apărut o eroare internă a serverului',
  });
}
