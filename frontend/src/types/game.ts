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

export interface SearchGamesResponse {
  results: RawgSearchResult[];
}
