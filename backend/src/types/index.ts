import { Request } from 'express';

export type GameStatus = 'WANT_TO_PLAY' | 'PLAYING' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  avatar_url: string | null;
  created_at: Date;
}

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  created_at: Date;
}

export interface Game {
  id: string;
  rawg_id: number;
  title: string;
  cover_url: string | null;
  platform: string;
  release_year: number | null;
  genres: string;
}

export interface UserGame {
  id: string;
  user_id: string;
  game_id: string;
  status: GameStatus;
  rating: number | null;
  review: string | null;
  added_at: Date;
  updated_at: Date;
}

export interface LibraryItem extends UserGame {
  game: Game;
}

export type LibrarySortField = 'title' | 'rating' | 'added_at';
export type SortOrder = 'asc' | 'desc';

export interface LibraryQuery {
  status?: GameStatus;
  platform?: string;
  sort?: LibrarySortField;
  order?: SortOrder;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
}

export interface ProfileStats {
  totalGames: number;
  byStatus: {
    WANT_TO_PLAY: number;
    PLAYING: number;
    COMPLETED: number;
  };
  averageRating: number | null;
}

export interface RawgSearchResult {
  rawgId: number;
  title: string;
  coverUrl: string | null;
  platforms: string[];
  releaseYear: number | null;
  genres: string[];
}

export interface RawgGameDetails extends RawgSearchResult {
  description: string | null;
  metacritic: number | null;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
