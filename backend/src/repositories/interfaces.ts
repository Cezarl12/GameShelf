import {
  Game,
  GameStatus,
  LibraryItem,
  LibraryQuery,
  PaginatedResult,
  ProfileStats,
  User,
  UserGame,
} from '../types';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: {
    email: string;
    password_hash: string;
    username: string;
  }): Promise<User>;
  update(
    id: string,
    data: { username?: string; avatar_url?: string | null }
  ): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

export interface IGameRepository {
  findById(id: string): Promise<Game | null>;
  findByRawgId(rawgId: number): Promise<Game | null>;
  create(data: Omit<Game, 'id'>): Promise<Game>;
}

export interface ILibraryRepository {
  findById(id: string): Promise<LibraryItem | null>;
  findByUserAndGame(userId: string, gameId: string): Promise<UserGame | null>;
  findByUserId(
    userId: string,
    query: LibraryQuery
  ): Promise<PaginatedResult<LibraryItem>>;
  create(data: {
    user_id: string;
    game_id: string;
    status: GameStatus;
  }): Promise<LibraryItem>;
  update(
    id: string,
    data: {
      status?: GameStatus;
      rating?: number | null;
      review?: string | null;
    }
  ): Promise<LibraryItem | null>;
  delete(id: string): Promise<boolean>;
  deleteByUserId(userId: string): Promise<void>;
  getStatsByUserId(userId: string): Promise<ProfileStats>;
}
