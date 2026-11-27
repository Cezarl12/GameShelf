import { Badge } from '../common';
import {
  GAME_STATUS_BADGE_VARIANT,
  GAME_STATUS_LABELS,
  type LibraryItem,
} from '../../types/library';

interface GameCardProps {
  item: LibraryItem;
  viewMode?: 'grid' | 'list';
  onSelect?: (item: LibraryItem) => void;
}

const statusOverlayStyles = {
  COMPLETED: 'bg-accent text-white',
  PLAYING: 'bg-primary text-white',
  WANT_TO_PLAY: 'bg-secondary text-white',
} as const;

function GameCard({ item, viewMode = 'grid', onSelect }: GameCardProps) {
  const { game, status, rating, review } = item;
  const platforms = game.platform
    ? game.platform
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  if (viewMode === 'list') {
    return (
      <article
        onClick={() => onSelect?.(item)}
        className={`flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-xs transition-shadow hover:shadow-md sm:flex-row sm:items-center ${
          onSelect ? 'cursor-pointer' : ''
        }`}
      >
        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
          {game.cover_url ? (
            <img
              src={game.cover_url}
              alt={game.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-slate-800 p-2 text-center text-xs font-semibold text-white">
              {game.title}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-display text-base font-bold text-text-primary">
              {game.title}
            </h3>
            <Badge variant={GAME_STATUS_BADGE_VARIANT[status]}>
              {GAME_STATUS_LABELS[status]}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            {game.genres || 'Fără gen specificat'}
            {game.release_year ? ` • ${game.release_year}` : ''}
          </p>
          {review && (
            <p className="mt-1.5 line-clamp-1 text-xs text-text-secondary">
              „{review}”
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            ★ {rating !== null ? `${rating}/10` : '—'}
          </span>
          {platforms.length > 0 && (
            <span className="max-w-[160px] truncate rounded-md bg-slate-100 px-2 py-0.5 text-xs text-secondary">
              {platforms.slice(0, 2).join(' / ')}
            </span>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => onSelect?.(item)}
      className={`group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xs transition-all hover:shadow-md ${
        onSelect ? 'cursor-pointer' : ''
      }`}
    >
      {/* Cover image area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-200">
        {game.cover_url ? (
          <img
            src={game.cover_url}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-slate-800 p-4 text-center font-display text-lg font-bold text-white">
            {game.title}
          </div>
        )}

        {/* Gradient overlay for readability */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent" />

        {/* Top badges */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-xs ${statusOverlayStyles[status]}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
            {GAME_STATUS_LABELS[status]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface/95 px-2.5 py-0.5 text-xs font-semibold text-text-primary shadow-xs">
            <span className="text-amber-500">★</span>
            {rating !== null ? `${rating}/10` : '—'}
          </span>
        </div>

        {/* Title & genres overlaid on cover bottom */}
        <div className="absolute inset-x-3 bottom-3">
          {game.genres && (
            <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-200">
              {game.genres}
            </p>
          )}
          <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-white">
            {game.title}
          </h3>
        </div>
      </div>

      {/* Card footer */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-3.5">
        <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
          <span>{game.release_year ?? 'An necunoscut'}</span>
          {platforms.length > 0 && (
            <span className="max-w-[140px] truncate rounded-md bg-slate-100 px-2 py-0.5 font-medium text-secondary">
              {platforms.slice(0, 2).join(' / ')}
            </span>
          )}
        </div>

        {review && (
          <p className="line-clamp-2 text-xs text-text-secondary">„{review}”</p>
        )}

        <div className="flex items-center justify-between border-t border-border pt-2.5 text-xs font-medium text-primary">
          <span>Vezi detalii</span>
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </article>
  );
}

export default GameCard;
