import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import { RawgGameDetails, RawgSearchResult } from '../types';
import { MemoryCache } from '../utils/cache';
import { NotFoundError, ServiceUnavailableError } from '../utils/errors';

interface RawgPlatformEntry {
  platform?: { name?: string };
}

interface RawgGenreEntry {
  name?: string;
}

interface RawgApiGame {
  id: number;
  name: string;
  background_image?: string | null;
  released?: string | null;
  platforms?: RawgPlatformEntry[];
  genres?: RawgGenreEntry[];
  description_raw?: string | null;
  metacritic?: number | null;
}

interface RawgSearchResponse {
  results?: RawgApiGame[];
}

function parseReleaseYear(released?: string | null): number | null {
  if (!released) {
    return null;
  }
  const year = Number(released.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : null;
}

function mapRawgGame(raw: RawgApiGame): RawgSearchResult {
  return {
    rawgId: raw.id,
    title: raw.name,
    coverUrl: raw.background_image ?? null,
    platforms: (raw.platforms ?? [])
      .map((p) => p.platform?.name)
      .filter((name): name is string => Boolean(name)),
    releaseYear: parseReleaseYear(raw.released),
    genres: (raw.genres ?? [])
      .map((g) => g.name)
      .filter((name): name is string => Boolean(name)),
  };
}

export class GamesService {
  private readonly http: AxiosInstance;
  private readonly searchCache: MemoryCache<RawgSearchResult[]>;
  private readonly detailsCache: MemoryCache<RawgGameDetails>;

  constructor(
    httpClient?: AxiosInstance,
    searchCache = new MemoryCache<RawgSearchResult[]>(10 * 60 * 1000),
    detailsCache = new MemoryCache<RawgGameDetails>(10 * 60 * 1000)
  ) {
    this.http =
      httpClient ??
      axios.create({
        baseURL: env.rawgBaseUrl,
        timeout: 8000,
      });
    this.searchCache = searchCache;
    this.detailsCache = detailsCache;
  }

  async searchGames(query: string): Promise<RawgSearchResult[]> {
    const cacheKey = `search:${query.trim().toLowerCase()}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.http.get<RawgSearchResponse>('/games', {
        params: {
          key: env.rawgApiKey,
          search: query,
          page_size: 20,
        },
      });
      const results = (response.data.results ?? []).map(mapRawgGame);
      this.searchCache.set(cacheKey, results);
      return results;
    } catch {
      throw new ServiceUnavailableError(
        'Serviciul RAWG nu răspunde momentan. Încercați mai târziu.'
      );
    }
  }

  async getGameByRawgId(rawgId: number): Promise<RawgGameDetails> {
    const cacheKey = `details:${rawgId}`;
    const cached = this.detailsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.http.get<RawgApiGame>(`/games/${rawgId}`, {
        params: {
          key: env.rawgApiKey,
        },
      });
      const base = mapRawgGame(response.data);
      const details: RawgGameDetails = {
        ...base,
        description: response.data.description_raw ?? null,
        metacritic: response.data.metacritic ?? null,
      };
      this.detailsCache.set(cacheKey, details);
      return details;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Jocul nu a fost găsit în RAWG');
      }
      throw new ServiceUnavailableError(
        'Serviciul RAWG nu răspunde momentan. Încercați mai târziu.'
      );
    }
  }
}
