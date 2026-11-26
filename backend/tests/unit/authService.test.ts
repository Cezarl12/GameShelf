import { InMemoryUserRepository } from '../../src/repositories/userRepository';
import { AuthService } from '../../src/services/authService';
import { ConflictError, UnauthorizedError } from '../../src/utils/errors';

describe('AuthService', () => {
  let userRepository: InMemoryUserRepository;
  let authService: AuthService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    authService = new AuthService(userRepository);
  });

  it('registers a new user, hashes the password, and returns a JWT without password_hash', async () => {
    const result = await authService.register({
      email: 'test@example.com',
      password: 'Password123',
      username: 'PlayerOne',
    });

    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.username).toBe('PlayerOne');
    expect(
      (result.user as unknown as Record<string, unknown>).password_hash
    ).toBeUndefined();

    const stored = await userRepository.findByEmail('test@example.com');
    expect(stored).not.toBeNull();
    expect(stored!.password_hash).not.toBe('Password123');
    expect(stored!.password_hash.startsWith('$2')).toBe(true);
  });

  it('throws ConflictError (409) when registering with an existing email', async () => {
    await authService.register({
      email: 'dup@example.com',
      password: 'Password123',
      username: 'User1',
    });

    await expect(
      authService.register({
        email: 'dup@example.com',
        password: 'Password456',
        username: 'User2',
      })
    ).rejects.toThrow(ConflictError);
  });

  it('logs in an existing user with valid credentials and returns a JWT', async () => {
    await authService.register({
      email: 'login@example.com',
      password: 'SecretPassword1',
      username: 'Gamer',
    });

    const result = await authService.login({
      email: 'login@example.com',
      password: 'SecretPassword1',
    });

    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe('login@example.com');
  });

  it('throws UnauthorizedError (401) with identical message for wrong email and wrong password', async () => {
    await authService.register({
      email: 'user@example.com',
      password: 'CorrectPassword1',
      username: 'User',
    });

    let wrongEmailMsg = '';
    let wrongPasswordMsg = '';

    try {
      await authService.login({
        email: 'nonexistent@example.com',
        password: 'CorrectPassword1',
      });
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedError);
      wrongEmailMsg = (err as UnauthorizedError).message;
    }

    try {
      await authService.login({
        email: 'user@example.com',
        password: 'WrongPassword',
      });
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedError);
      wrongPasswordMsg = (err as UnauthorizedError).message;
    }

    expect(wrongEmailMsg).toBeTruthy();
    expect(wrongEmailMsg).toBe(wrongPasswordMsg);
  });
});
