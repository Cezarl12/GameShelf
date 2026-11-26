import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { IUserRepository } from '../repositories';
import { JwtPayload, PublicUser, User } from '../types';
import { ConflictError, UnauthorizedError } from '../utils/errors';

const SALT_ROUNDS = 10;
const INVALID_CREDENTIALS_MESSAGE = 'Email sau parolă incorectă';

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
  };
}

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  private signToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };
    const options: SignOptions = {
      expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, env.jwtSecret, options);
  }

  async register(input: {
    email: string;
    password: string;
    username: string;
  }): Promise<{ token: string; user: PublicUser }> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Adresa de email este deja utilizată');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await this.userRepository.create({
      email: input.email,
      password_hash: passwordHash,
      username: input.username,
    });

    const token = this.signToken(user);
    return {
      token,
      user: toPublicUser(user),
    };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: PublicUser }> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.password_hash
    );
    if (!passwordMatches) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    const token = this.signToken(user);
    return {
      token,
      user: toPublicUser(user),
    };
  }
}
