import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { IUserRepository, userRepository } from '../repositories';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { UnauthorizedError } from '../utils/errors';

export function createAuthMiddleware(repo: IUserRepository) {
  return async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next(new UnauthorizedError('Token de autentificare lipsă'));
      return;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      next(new UnauthorizedError('Token de autentificare invalid'));
      return;
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
      const user = await repo.findById(decoded.userId);
      if (!user) {
        next(new UnauthorizedError('Token invalid sau cont șters'));
        return;
      }

      req.user = {
        userId: user.id,
        email: user.email,
      };
      next();
    } catch {
      next(new UnauthorizedError('Token invalid sau expirat'));
    }
  };
}

export const authenticateToken = createAuthMiddleware(userRepository);
