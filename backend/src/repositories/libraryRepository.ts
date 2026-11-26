import crypto from 'crypto';
import {
  GameStatus,
  LibraryItem,
  LibraryQuery,
  PaginatedResult,
  ProfileStats,
  UserGame,
} from '../types';
import { IGameRepository, ILibraryRepository } from './interfaces';

export class InMemoryLibraryRepository implements ILibraryRepository {
  private readonly entries = new Map<string, UserGame>();

  constructor(private readonly gameRepository: IGameRepository) {}

  private async hydrate(entry: UserGame): Promise<LibraryItem | null> {
    const game = await this.gameRepository.findById(entry.game_id);
    if (!game) {
      return null;
    }
    return { ...entry, game };
  }

  async findById(id: string): Promise<LibraryItem | null> {
    const entry = this.entries.get(id);
    if (!entry) {
      return null;
    }
    return this.hydrate(entry);
  }

  async findByUserAndGame(
    userId: string,
    gameId: string
  ): Promise<UserGame | null> {
    for (const entry of this.entries.values()) {
      if (entry.user_id === userId && entry.game_id === gameId) {
        return entry;
      }
    }
    return null;
  }

  async findByUserId(
    userId: string,
    query: LibraryQuery
  ): Promise<PaginatedResult<LibraryItem>> {
    const userEntries: LibraryItem[] = [];
    for (const entry of this.entries.values()) {
      if (entry.user_id !== userId) {
        continue;
      }
      const hydrated = await this.hydrate(entry);
      if (hydrated) {
        userEntries.push(hydrated);
      }
    }

    let filtered = userEntries;
    if (query.status) {
      filtered = filtered.filter((item) => item.status === query.status);
    }
    if (query.platform) {
      const targetPlatform = query.platform.toLowerCase();
      filtered = filtered.filter((item) =>
        item.game.platform.toLowerCase().includes(targetPlatform)
      );
    }

    const sortField = query.sort ?? 'added_at';
    const orderFactor = query.order === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      if (sortField === 'title') {
        return a.game.title.localeCompare(b.game.title) * orderFactor;
      }
      if (sortField === 'rating') {
        const ratingA = a.rating ?? -1;
        const ratingB = b.rating ?? -1;
        return (ratingA - ratingB) * orderFactor;
      }
      return (a.added_at.getTime() - b.added_at.getTime()) * orderFactor;
    });

    const total = filtered.length;
    const offset = (query.page - 1) * query.limit;
    const items = filtered.slice(offset, offset + query.limit);

    return {
      items,
      total,
      page: query.page,
    };
  }

  async create(data: {
    user_id: string;
    game_id: string;
    status: GameStatus;
  }): Promise<LibraryItem> {
    const now = new Date();
    const entry: UserGame = {
      id: crypto.randomUUID(),
      user_id: data.user_id,
      game_id: data.game_id,
      status: data.status,
      rating: null,
      review: null,
      added_at: now,
      updated_at: now,
    };
    this.entries.set(entry.id, entry);
    const hydrated = await this.hydrate(entry);
    if (!hydrated) {
      throw new Error('Jocul asociat nu a putut fi încărcat');
    }
    return hydrated;
  }

  async update(
    id: string,
    data: {
      status?: GameStatus;
      rating?: number | null;
      review?: string | null;
    }
  ): Promise<LibraryItem | null> {
    const existing = this.entries.get(id);
    if (!existing) {
      return null;
    }
    const updated: UserGame = {
      ...existing,
      status: data.status !== undefined ? data.status : existing.status,
      rating: data.rating !== undefined ? data.rating : existing.rating,
      review: data.review !== undefined ? data.review : existing.review,
      updated_at: new Date(),
    };
    this.entries.set(id, updated);
    return this.hydrate(updated);
  }

  async delete(id: string): Promise<boolean> {
    return this.entries.delete(id);
  }

  async deleteByUserId(userId: string): Promise<void> {
    for (const [id, entry] of this.entries.entries()) {
      if (entry.user_id === userId) {
        this.entries.delete(id);
      }
    }
  }

  async getStatsByUserId(userId: string): Promise<ProfileStats> {
    const byStatus = {
      WANT_TO_PLAY: 0,
      PLAYING: 0,
      COMPLETED: 0,
    };
    let totalGames = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    for (const entry of this.entries.values()) {
      if (entry.user_id !== userId) {
        continue;
      }
      totalGames += 1;
      byStatus[entry.status] += 1;
      if (entry.rating !== null) {
        ratingSum += entry.rating;
        ratingCount += 1;
      }
    }

    const averageRating =
      ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : null;

    return {
      totalGames,
      byStatus,
      averageRating,
    };
  }

  clear(): void {
    this.entries.clear();
  }
}
