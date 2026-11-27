import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card } from '../components/common';
import GameCard from '../components/library/GameCard';
import { getApiErrorMessage } from '../services/api';
import { libraryService } from '../services/libraryService';
import {
  GAME_STATUS_LABELS,
  type GameStatus,
  type LibraryItem,
  type LibrarySortField,
  type ProfileStats,
  type SortOrder,
} from '../types/library';

type StatusFilter = 'ALL' | GameStatus;
type SortOption =
  'added_at:desc' | 'rating:desc' | 'rating:asc' | 'title:asc' | 'title:desc';

const PAGE_LIMIT = 12;

const PLATFORM_OPTIONS = [
  { value: '', label: 'Toate platformele' },
  { value: 'PC', label: 'PC' },
  { value: 'PlayStation', label: 'PlayStation' },
  { value: 'Xbox', label: 'Xbox' },
  { value: 'Nintendo', label: 'Nintendo Switch' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'added_at:desc', label: 'Recent adăugate' },
  { value: 'rating:desc', label: 'Notă (mare → mic)' },
  { value: 'rating:asc', label: 'Notă (mic → mare)' },
  { value: 'title:asc', label: 'Titlu (A → Z)' },
  { value: 'title:desc', label: 'Titlu (Z → A)' },
];

function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<ProfileStats | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [platformFilter, setPlatformFilter] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('added_at:desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLibraryData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [sortField, sortOrder] = sortOption.split(':') as [
      LibrarySortField,
      SortOrder,
    ];

    try {
      const [libraryResult, statsResult] = await Promise.all([
        libraryService.getLibrary({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          platform: platformFilter || undefined,
          sort: sortField,
          order: sortOrder,
          page,
          limit: PAGE_LIMIT,
        }),
        libraryService.getStats().catch(() => null),
      ]);

      setItems(libraryResult.items);
      setTotal(libraryResult.total);
      if (statsResult) {
        setStats(statsResult);
      }
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Nu am putut încărca biblioteca de jocuri.')
      );
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, platformFilter, sortOption, page]);

  useEffect(() => {
    void fetchLibraryData();
  }, [fetchLibraryData]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.game.title.toLowerCase().includes(q) ||
        item.game.genres.toLowerCase().includes(q) ||
        item.game.platform.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const completionRate =
    stats && stats.totalGames > 0
      ? Math.round((stats.byStatus.COMPLETED / stats.totalGames) * 100)
      : 0;

  const hasActiveFilters =
    statusFilter !== 'ALL' ||
    platformFilter !== '' ||
    searchQuery.trim() !== '';

  const resetFilters = () => {
    setStatusFilter('ALL');
    setPlatformFilter('');
    setSearchQuery('');
    setPage(1);
  };

  const statusTabs: { value: StatusFilter; label: string; count?: number }[] = [
    { value: 'ALL', label: 'Toate', count: stats?.totalGames },
    {
      value: 'PLAYING',
      label: GAME_STATUS_LABELS.PLAYING,
      count: stats?.byStatus.PLAYING,
    },
    {
      value: 'COMPLETED',
      label: GAME_STATUS_LABELS.COMPLETED,
      count: stats?.byStatus.COMPLETED,
    },
    {
      value: 'WANT_TO_PLAY',
      label: GAME_STATUS_LABELS.WANT_TO_PLAY,
      count: stats?.byStatus.WANT_TO_PLAY,
    },
  ];

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Biblioteca mea
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Urmărește jocurile pe care le joci, le-ai finalizat sau le ai pe
            listă.
          </p>
        </div>

        <Link to="/search">
          <Button variant="primary">+ Adaugă joc</Button>
        </Link>
      </div>

      {/* 4 Summary Stat Cards (matching desktop wireframe) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card padding="sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Total jocuri
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-text-primary">
            {stats?.totalGames ?? total}
          </p>
        </Card>

        <Card padding="sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            În desfășurare
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-primary">
            {stats?.byStatus.PLAYING ?? 0}
          </p>
        </Card>

        <Card padding="sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Finalizate
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-accent">
              {stats?.byStatus.COMPLETED ?? 0}
            </span>
            <span className="text-xs font-medium text-emerald-700">
              {completionRate}%
            </span>
          </div>
        </Card>

        <Card padding="sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Notă medie
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-text-primary">
            {stats?.averageRating !== null && stats?.averageRating !== undefined
              ? `${stats.averageRating.toFixed(1)} / 10`
              : '—'}
          </p>
        </Card>
      </div>

      {/* Filter & Controls Bar */}
      <Card padding="sm" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status filter pills */}
          <div
            role="tablist"
            aria-label="Filtrare după status"
            className="flex flex-wrap items-center gap-2"
          >
            {statusTabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-secondary hover:bg-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-surface text-text-secondary'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Grid / List View Switcher */}
          <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Vizualizare grilă"
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Grilă
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Vizualizare listă"
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Listă
            </button>
          </div>
        </div>

        {/* Search, Platform & Sort controls */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-6">
            <input
              type="search"
              aria-label="Caută în bibliotecă"
              placeholder="Caută în bibliotecă după titlu, gen sau platformă..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-text-primary placeholder:text-slate-400 focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filtrează după platformă"
              value={platformFilter}
              onChange={(e) => {
                setPlatformFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {PLATFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Sortează jocurile"
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as SortOption);
                setPage(1);
              }}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="error" title="Eroare la încărcare">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchLibraryData()}
            >
              Reîncearcă
            </Button>
          </div>
        </Alert>
      )}

      {/* Loading State (Skeleton grid) */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border border-border bg-surface"
            >
              <div className="aspect-[3/4] animate-pulse bg-slate-200" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredItems.length === 0 && (
        <Card padding="lg" className="text-center">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            {hasActiveFilters
              ? 'Niciun joc nu corespunde filtrelor'
              : 'Biblioteca ta este goală'}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {hasActiveFilters
              ? 'Încearcă să modifici sau să resetezi filtrele selectate.'
              : 'Caută jocurile tale preferate și adaugă-le în colecția ta personală.'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                Resetează filtrele
              </Button>
            )}
            <Link to="/search">
              <Button variant="primary">Caută și adaugă jocuri</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Games Grid / List */}
      {!isLoading && !error && filteredItems.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredItems.map((item) => (
                <GameCard key={item.id} item={item} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <GameCard key={item.id} item={item} viewMode="list" />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
              <p className="text-xs text-text-secondary">
                Pagina <span className="font-semibold">{page}</span> din{' '}
                <span className="font-semibold">{totalPages}</span> ({total}{' '}
                jocuri în total)
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Următor →
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default LibraryPage;
