import { ILibraryRepository, IUserRepository } from '../repositories';
import { ProfileStats, PublicUser } from '../types';
import { NotFoundError } from '../utils/errors';
import { toPublicUser } from './authService';

export class ProfileService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly libraryRepository: ILibraryRepository
  ) {}

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Utilizatorul nu a fost găsit');
    }
    return toPublicUser(user);
  }

  async updateProfile(
    userId: string,
    data: { username?: string; avatarUrl?: string | null }
  ): Promise<PublicUser> {
    const updated = await this.userRepository.update(userId, {
      username: data.username,
      avatar_url: data.avatarUrl,
    });
    if (!updated) {
      throw new NotFoundError('Utilizatorul nu a fost găsit');
    }
    return toPublicUser(updated);
  }

  async getStats(userId: string): Promise<ProfileStats> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Utilizatorul nu a fost găsit');
    }
    return this.libraryRepository.getStatsByUserId(userId);
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Utilizatorul nu a fost găsit');
    }
    await this.libraryRepository.deleteByUserId(userId);
    await this.userRepository.delete(userId);
  }
}
