import { useState } from 'react';
import { Badge, Button, Card } from '../common';
import type { RawgSearchResult } from '../../types/game';
import {
  GAME_STATUS_BADGE_VARIANT,
  GAME_STATUS_LABELS,
  type GameStatus,
} from '../../types/library';

interface SearchGameCardProps {
  game: RawgSearchResult;
  libraryStatus?: GameStatus;
  isAdding: boolean;
  onAdd: (game: RawgSearchResult, status: GameStatus) => void;
  onViewDetails: (game: RawgSearchResult) => void;
}

const STATUS_OPTIONS: GameStatus[] = ['WANT_TO_PLAY', 'PLAYING', 'COMPLETED'];

function SearchGameCard({
  game,
  libraryStatus,
  isAdding,
  onAdd,
  onViewDetails,
}: SearchGameCardProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<GameStatus>('WANT_TO_PLAY');
  const [imageError, setImageError] = useState(false);

  const isInLibrary = Boolean(libraryStatus);
  const visiblePlatforms = game.platforms.slice(0, 3);
  const extraPlatformsCount = Math.max(0, game.platforms.length - 3);
  const visibleGenres = game.genres.slice(0, 3);

  return (
    <Card
      padding="none"
      className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      {/* Cover Image */}
      <button
        type="button"
        onClick={() => onViewDetails(game)}
        className="group relative block aspect-video w-full overflow-hidden bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Vezi detalii pentru ${game.title}`}
      >
        {game.coverUrl && !imageError ? (
          <img
            src={game.coverUrl}
            alt={game.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-text-secondary">
            <svg
              className="h-10 w-10 opacity-50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="2" y="6" width="20" height="12" rx="3" />
              <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" />
            </svg>
            <span className="mt-1 text-xs">Fără imagine</span>
          </div>
        )}

        {game.releaseYear && (
          <span className="absolute top-2.5 right-2.5 rounded-md bg-slate-900/75 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-xs">
            {game.releaseYear}
          </span>
        )}

        {libraryStatus && (
          <div className="absolute top-2.5 left-2.5">
            <Badge variant={GAME_STATUS_BADGE_VARIANT[libraryStatus]}>
              ✓ {GAME_STATUS_LABELS[libraryStatus]}
            </Badge>
          </div>
        )}
      </button>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(game)}
            className="line-clamp-2 text-left font-display text-base font-semibold text-text-primary transition-colors hover:text-primary"
          >
            {game.title}
          </button>
        </div>

        {/* Genres */}
        {visibleGenres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visibleGenres.map((genre) => (
              <Badge key={genre} variant="default">
                {genre}
              </Badge>
            ))}
          </div>
        )}

        {/* Platforms */}
        <p className="mt-2.5 line-clamp-1 text-xs text-text-secondary">
          {visiblePlatforms.length > 0 ? (
            <>
              <span className="font-medium text-text-primary">Platforme: </span>
              {visiblePlatforms.join(', ')}
              {extraPlatformsCount > 0 && ` +${extraPlatformsCount}`}
            </>
          ) : (
            'Platforme nespecificate'
          )}
        </p>

        {/* Actions */}
        <div className="mt-auto pt-4">
          {isInLibrary ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                disabled
                className="border-emerald-200 bg-emerald-50 text-emerald-700 disabled:opacity-90"
              >
                ✓ În bibliotecă
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(game)}
              >
                Detalii
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor={`status-${game.rawgId}`}>
                Status inițial pentru {game.title}
              </label>
              <select
                id={`status-${game.rawgId}`}
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as GameStatus)
                }
                disabled={isAdding}
                className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 sm:w-32"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {GAME_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>

              <Button
                variant="primary"
                size="sm"
                fullWidth
                isLoading={isAdding}
                onClick={() => onAdd(game, selectedStatus)}
              >
                + Adaugă
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default SearchGameCard;
