import api from './api';
import type {
  RawgGameDetails,
  RawgSearchResult,
  SearchGamesResponse,
} from '../types/game';

export const gamesService = {
  async searchGames(query: string): Promise<RawgSearchResult[]> {
    const { data } = await api.get<SearchGamesResponse>('/games/search', {
      params: { q: query.trim() },
    });
    return data.results;
  },

  async getGameDetails(rawgId: number): Promise<RawgGameDetails> {
    const { data } = await api.get<RawgGameDetails>(`/games/${rawgId}`);
    return data;
  },
};
