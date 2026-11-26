import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';
import { createAuthMiddleware } from '../../src/middleware/authMiddleware';
import { InMemoryUserRepository } from '../../src/repositories/userRepository';
import { AuthenticatedRequest } from '../../src/types';
import { UnauthorizedError } from '../../src/utils/errors';

describe('authMiddleware', () => {
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
  });

  it('calls next with UnauthorizedError (401) when Authorization header is missing', async () => {
    const middleware = createAuthMiddleware(userRepository);
    const req = { headers: {} } as AuthenticatedRequest;
    const next = jest.fn();

    await middleware(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('calls next with UnauthorizedError (401) when token is invalid', async () => {
    const middleware = createAuthMiddleware(userRepository);
    const req = {
      headers: { authorization: 'Bearer invalid.jwt.token' },
    } as AuthenticatedRequest;
    const next = jest.fn();

    await middleware(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('attaches req.user for valid token and rejects after user is deleted', async () => {
    const user = await userRepository.create({
      email: 'auth@example.com',
      password_hash: 'hash',
      username: 'AuthUser',
    });
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: '24h' }
    );
    const middleware = createAuthMiddleware(userRepository);

    const req1 = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthenticatedRequest;
    const next1 = jest.fn();

    await middleware(req1, {} as Response, next1);
    expect(next1).toHaveBeenCalledWith();
    expect(req1.user).toEqual({ userId: user.id, email: user.email });

    await userRepository.delete(user.id);
    const req2 = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthenticatedRequest;
    const next2 = jest.fn();

    await middleware(req2, {} as Response, next2);
    expect(next2).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
