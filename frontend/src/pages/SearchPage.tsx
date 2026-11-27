import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
  Alert,
  Badge,
  Button,
  Card,
  LoadingSpinner,
  Modal,
} from '../components/common';
import SearchGameCard from '../components/search/SearchGameCard';
import { getApiErrorMessage } from '../services/api';
import { gamesService } from '../services/gamesService';
import { libraryService } from '../services/libraryService';
import type { RawgGameDetails, RawgSearchResult } from '../types/game';
import {
  GAME_STATUS_BADGE_VARIANT,
  GAME_STATUS_LABELS,
  type GameStatus,
} from '../types/library';

const POPULAR_SUGGESTIONS = [
  'The Witcher 3',
  'Elden Ring',
  'Hades',
  'Cyberpunk 2077',
  'Hollow Knight',
  'Red Dead Redemption 2',
];

const STATUS_OPTIONS: GameStatus[] = ['WANT_TO_PLAY', 'PLAYING', 'COMPLETED'];

function SearchPage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<RawgSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Map rawgId -> GameStatus for games already in the user's library
  const [libraryMap, setLibraryMap] = useState<Record<number, GameStatus>>({});
  const [addingIds, setAddingIds] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<{
    variant: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Details modal state
  const [selectedGame, setSelectedGame] = useState<RawgSearchResult | null>(
    null
  );
  const [gameDetails, setGameDetails] = useState<RawgGameDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [modalStatus, setModalStatus] = useState<GameStatus>('WANT_TO_PLAY');

  const requestIdRef = useRef(0);

  // Load existing library items so we can mark games already added
  useEffect(() => {
    let isMounted = true;

    const loadExistingLibrary = async () => {
      try {
        const firstPage = await libraryService.getLibrary({
          page: 1,
          limit: 50,
        });
        if (!isMounted) return;

        const map: Record<number, GameStatus> = {};
        for (const item of firstPage.items) {
          map[item.game.rawg_id] = item.status;
        }
        setLibraryMap(map);
      } catch {
        // Non-blocking: user can still search even if library pre-fetch fails
      }
    };

    void loadExistingLibrary();
    return () => {
      isMounted = false;
    };
  }, []);

  const executeSearch = useCallback(async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setSearchError(null);
      setSubmittedQuery('');
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setIsSearching(true);
    setSearchError(null);
    setSubmittedQuery(trimmed);

    try {
      const data = await gamesService.searchGames(trimmed);
      if (currentRequestId !== requestIdRef.current) return;
      setResults(data);
      setHasSearched(true);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      setSearchError(
        getApiErrorMessage(
          err,
          'Nu am putut realiza căutarea. Încearcă din nou.'
        )
      );
      setResults([]);
      setHasSearched(true);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsSearching(false);
      }
    }
  }, []);

  // Debounced auto-search while typing (for queries of at least 2 characters)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      requestIdRef.current += 1;
      setResults([]);
      setHasSearched(false);
      setSearchError(null);
      setSubmittedQuery('');
      setIsSearching(false);
      return;
    }

    if (trimmed.length < 2) {
      return;
    }

    const timer = window.setTimeout(() => {
      void executeSearch(trimmed);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [query, executeSearch]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    void executeSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    void executeSearch(suggestion);
  };

  const handleAddGame = async (game: RawgSearchResult, status: GameStatus) => {
    setFeedback(null);
    setAddingIds((prev) => ({ ...prev, [game.rawgId]: true }));

    try {
      const addedItem = await libraryService.addGame(game.rawgId, status);
      setLibraryMap((prev) => ({
        ...prev,
        [game.rawgId]: addedItem.status,
      }));
      setFeedback({
        variant: 'success',
        message: `„${game.title}” a fost adăugat în bibliotecă (${GAME_STATUS_LABELS[addedItem.status]}).`,
      });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setLibraryMap((prev) => ({
          ...prev,
          [game.rawgId]: prev[game.rawgId] ?? status,
        }));
        setFeedback({
          variant: 'info',
          message: `„${game.title}” se află deja în biblioteca ta.`,
        });
      } else {
        setFeedback({
          variant: 'error',
          message: getApiErrorMessage(
            err,
            `Nu am putut adăuga „${game.title}” în bibliotecă.`
          ),
        });
      }
    } finally {
      setAddingIds((prev) => {
        const next = { ...prev };
        delete next[game.rawgId];
        return next;
      });
    }
  };

  const handleViewDetails = async (game: RawgSearchResult) => {
    setSelectedGame(game);
    setGameDetails(null);
    setDetailsError(null);
    setModalStatus('WANT_TO_PLAY');
    setIsLoadingDetails(true);

    try {
      const details = await gamesService.getGameDetails(game.rawgId);
      setGameDetails(details);
    } catch (err) {
      setDetailsError(
        getApiErrorMessage(err, 'Nu am putut încărca detaliile jocului.')
      );
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedGame(null);
    setGameDetails(null);
    setDetailsError(null);
  };

  const selectedLibraryStatus = selectedGame
    ? libraryMap[selectedGame.rawgId]
    : undefined;

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Căutare jocuri
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Descoperă jocuri din catalogul RAWG și adaugă-le rapid în biblioteca
            ta.
          </p>
        </div>

        <Link to="/library">
          <Button variant="outline">← Biblioteca mea</Button>
        </Link>
      </div>

      {/* Search Form */}
      <Card padding="md">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <label htmlFor="game-search-input" className="sr-only">
              Caută un joc după titlu
            </label>
            <svg
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-text-secondary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="game-search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută după titlu (ex: The Witcher 3, Elden Ring, Hades)..."
              autoComplete="off"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pr-10 pl-10 text-sm text-text-primary placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setFeedback(null);
                }}
                aria-label="Șterge textul căutării"
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-text-secondary hover:bg-slate-100 hover:text-text-primary"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSearching}
            disabled={!query.trim()}
          >
            Caută
          </Button>
        </form>

        {/* Quick suggestions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">
            Sugestii rapide:
          </span>
          {POPULAR_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="rounded-full border border-border bg-slate-50 px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-primary hover:bg-indigo-50 hover:text-primary"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </Card>

      {/* Feedback Banner */}
      {feedback && (
        <Alert variant={feedback.variant}>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <span>{feedback.message}</span>
            <div className="flex items-center gap-3">
              {feedback.variant === 'success' && (
                <Link
                  to="/library"
                  className="font-semibold underline hover:no-underline"
                >
                  Vezi în bibliotecă →
                </Link>
              )}
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-xs font-medium opacity-75 hover:opacity-100"
              >
                Închide
              </button>
            </div>
          </div>
        </Alert>
      )}

      {/* Search Error */}
      {searchError && (
        <Alert variant="error" title="Eroare la căutare">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <span>{searchError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void executeSearch(query)}
            >
              Reîncearcă
            </Button>
          </div>
        </Alert>
      )}

      {/* Loading Skeletons */}
      {isSearching && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Se caută jocuri pentru „{submittedQuery}”...
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                padding="none"
                className="animate-pulse overflow-hidden"
              >
                <div className="aspect-video w-full bg-slate-200" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-slate-200" />
                    <div className="h-5 w-20 rounded-full bg-slate-200" />
                  </div>
                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                  <div className="h-8 w-full rounded-lg bg-slate-200" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Idle State (before first search) */}
      {!isSearching && !hasSearched && !searchError && (
        <Card padding="lg" className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-primary">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-text-primary">
            Începe o căutare
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-text-secondary">
            Introdu numele unui joc în bara de mai sus sau alege una dintre
            sugestiile rapide pentru a vedea rezultatele.
          </p>
        </Card>
      )}

      {/* Empty Results */}
      {!isSearching && hasSearched && !searchError && results.length === 0 && (
        <Card padding="lg" className="text-center">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Niciun rezultat pentru „{submittedQuery}”
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-text-secondary">
            Verifică ortografia sau încearcă un titlu mai scurt ori un alt
            termen de căutare.
          </p>
        </Card>
      )}

      {/* Results Grid */}
      {!isSearching && !searchError && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Am găsit{' '}
              <span className="font-semibold text-text-primary">
                {results.length}
              </span>{' '}
              {results.length === 1 ? 'joc' : 'jocuri'} pentru „{submittedQuery}
              ”
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((game) => (
              <SearchGameCard
                key={game.rawgId}
                game={game}
                libraryStatus={libraryMap[game.rawgId]}
                isAdding={Boolean(addingIds[game.rawgId])}
                onAdd={handleAddGame}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Game Details Modal */}
      <Modal
        isOpen={Boolean(selectedGame)}
        onClose={handleCloseDetails}
        title={selectedGame?.title ?? 'Detalii joc'}
        footer={
          selectedGame && (
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="ghost" onClick={handleCloseDetails}>
                Închide
              </Button>

              {selectedLibraryStatus ? (
                <Badge
                  variant={GAME_STATUS_BADGE_VARIANT[selectedLibraryStatus]}
                >
                  ✓ În bibliotecă ({GAME_STATUS_LABELS[selectedLibraryStatus]})
                </Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Status inițial"
                    value={modalStatus}
                    onChange={(e) =>
                      setModalStatus(e.target.value as GameStatus)
                    }
                    disabled={Boolean(addingIds[selectedGame.rawgId])}
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {GAME_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="primary"
                    isLoading={Boolean(addingIds[selectedGame.rawgId])}
                    onClick={() =>
                      void handleAddGame(selectedGame, modalStatus)
                    }
                  >
                    + Adaugă în bibliotecă
                  </Button>
                </div>
              )}
            </div>
          )
        }
      >
        {isLoadingDetails ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner label="Se încarcă detaliile jocului..." />
          </div>
        ) : detailsError ? (
          <Alert variant="error">{detailsError}</Alert>
        ) : (
          selectedGame && (
            <div className="space-y-4">
              {(gameDetails?.coverUrl ?? selectedGame.coverUrl) && (
                <img
                  src={gameDetails?.coverUrl ?? selectedGame.coverUrl ?? ''}
                  alt={selectedGame.title}
                  className="aspect-video w-full rounded-lg object-cover"
                />
              )}

              <div className="flex flex-wrap items-center gap-2">
                {(gameDetails?.releaseYear ?? selectedGame.releaseYear) && (
                  <Badge variant="default">
                    Lansare:{' '}
                    {gameDetails?.releaseYear ?? selectedGame.releaseYear}
                  </Badge>
                )}
                {gameDetails?.metacritic !== null &&
                  gameDetails?.metacritic !== undefined && (
                    <Badge variant="success">
                      Metacritic: {gameDetails.metacritic}
                    </Badge>
                  )}
                {(gameDetails?.genres ?? selectedGame.genres).map((genre) => (
                  <Badge key={genre} variant="primary">
                    {genre}
                  </Badge>
                ))}
              </div>

              {(gameDetails?.platforms ?? selectedGame.platforms).length >
                0 && (
                <p className="text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">
                    Platforme:{' '}
                  </span>
                  {(gameDetails?.platforms ?? selectedGame.platforms).join(
                    ', '
                  )}
                </p>
              )}

              {gameDetails?.description ? (
                <p className="max-h-48 overflow-y-auto text-sm leading-relaxed text-text-secondary">
                  {gameDetails.description}
                </p>
              ) : (
                <p className="text-sm italic text-text-secondary">
                  Nu există o descriere disponibilă pentru acest joc.
                </p>
              )}
            </div>
          )
        )}
      </Modal>
    </section>
  );
}

export default SearchPage;
