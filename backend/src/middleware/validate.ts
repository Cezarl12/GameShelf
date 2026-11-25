import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    Object.assign(req.query, parsed.data);
    next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    Object.assign(req.params, parsed.data);
    next();
  };
}
