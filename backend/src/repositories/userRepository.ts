import crypto from 'crypto';
import { User } from '../types';
import { IUserRepository } from './interfaces';

export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return null;
  }

  async create(data: {
    email: string;
    password_hash: string;
    username: string;
  }): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: data.email.toLowerCase(),
      password_hash: data.password_hash,
      username: data.username,
      avatar_url: null,
      created_at: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async update(
    id: string,
    data: { username?: string; avatar_url?: string | null }
  ): Promise<User | null> {
    const existing = this.users.get(id);
    if (!existing) {
      return null;
    }
    const updated: User = {
      ...existing,
      username: data.username !== undefined ? data.username : existing.username,
      avatar_url:
        data.avatar_url !== undefined ? data.avatar_url : existing.avatar_url,
    };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  clear(): void {
    this.users.clear();
  }
}
