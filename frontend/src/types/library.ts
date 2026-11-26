export type GameStatus = 'WANT_TO_PLAY' | 'PLAYING' | 'COMPLETED';

export interface Game {
  id: string;
  rawg_id: number;
  title: string;
  cover_url: string | null;
  platform: string;
  release_year: number | null;
  genres: string;
}

export interface LibraryItem {
  id: string;
  user_id: string;
  game_id: string;
  status: GameStatus;
  rating: number | null;
  review: string | null;
  added_at: string;
  updated_at: string;
  game: Game;
}

export type LibrarySortField = 'title' | 'rating' | 'added_at';
export type SortOrder = 'asc' | 'desc';

export interface LibraryQuery {
  status?: GameStatus;
  platform?: string;
  sort?: LibrarySortField;
  order?: SortOrder;
  page?: number;
  limit?: number;
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

export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  WANT_TO_PLAY: 'De jucat',
  PLAYING: 'În desfășurare',
  COMPLETED: 'Finalizat',
};

export const GAME_STATUS_BADGE_VARIANT: Record<
  GameStatus,
  'info' | 'primary' | 'success'
> = {
  WANT_TO_PLAY: 'info',
  PLAYING: 'primary',
  COMPLETED: 'success',
};
