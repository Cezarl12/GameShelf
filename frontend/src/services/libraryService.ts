import api from './api';
import type {
  GameStatus,
  LibraryItem,
  LibraryQuery,
  PaginatedResult,
  ProfileStats,
} from '../types/library';

export const libraryService = {
  async getLibrary(
    query: LibraryQuery = {}
  ): Promise<PaginatedResult<LibraryItem>> {
    const params: Record<string, string | number> = {};
    if (query.status) params.status = query.status;
    if (query.platform) params.platform = query.platform;
    if (query.sort) params.sort = query.sort;
    if (query.order) params.order = query.order;
    if (query.page) params.page = query.page;
    if (query.limit) params.limit = query.limit;

    const { data } = await api.get<PaginatedResult<LibraryItem>>('/library', {
      params,
    });
    return data;
  },

  async addGame(
    rawgId: number,
    status: GameStatus = 'WANT_TO_PLAY'
  ): Promise<LibraryItem> {
    const { data } = await api.post<LibraryItem>('/library', {
      rawgId,
      status,
    });
    return data;
  },

  async updateGame(
    id: string,
    payload: {
      status?: GameStatus;
      rating?: number | null;
      review?: string | null;
    }
  ): Promise<LibraryItem> {
    const { data } = await api.patch<LibraryItem>(`/library/${id}`, payload);
    return data;
  },

  async deleteGame(id: string): Promise<void> {
    await api.delete(`/library/${id}`);
  },

  async getStats(): Promise<ProfileStats> {
    const { data } = await api.get<ProfileStats>('/me/stats');
    return data;
  },
};
