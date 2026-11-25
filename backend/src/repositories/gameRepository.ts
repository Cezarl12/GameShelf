import crypto from 'crypto';
import { Game } from '../types';
import { IGameRepository } from './interfaces';

export class InMemoryGameRepository implements IGameRepository {
  private readonly games = new Map<string, Game>();

  async findById(id: string): Promise<Game | null> {
    return this.games.get(id) ?? null;
  }

  async findByRawgId(rawgId: number): Promise<Game | null> {
    for (const game of this.games.values()) {
      if (game.rawg_id === rawgId) {
        return game;
      }
    }
    return null;
  }

  async create(data: Omit<Game, 'id'>): Promise<Game> {
    const game: Game = {
      id: crypto.randomUUID(),
      ...data,
    };
    this.games.set(game.id, game);
    return game;
  }

  clear(): void {
    this.games.clear();
  }
}
