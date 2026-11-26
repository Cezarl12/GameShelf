import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Button from '../common/Button';

interface NavbarProps {
  isAuthenticated?: boolean;
  username?: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

const navLinks = [
  { to: '/library', label: 'Biblioteca mea' },
  { to: '/search', label: 'Căutare jocuri' },
  { to: '/profile', label: 'Profil' },
  { to: '/about', label: 'Despre' },
];

function Navbar({
  isAuthenticated = false,
  username,
  avatarUrl,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = username
    ? username
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-primary'
        : 'text-secondary hover:bg-slate-100 hover:text-text-primary'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/library"
          className="flex shrink-0 items-center"
          onClick={() => setMobileMenuOpen(false)}
        >
          <img src="/logo.svg" alt="GameShelf" className="h-9 w-auto" />
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Navigare principală"
          className="hidden items-center gap-1 md:flex"
        >
          {navLinks.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop auth actions */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="mr-1 flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-slate-100"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username ?? 'Avatar utilizator'}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-primary"
                  >
                    {initials}
                  </span>
                )}
                {username && (
                  <span className="text-sm font-medium text-secondary">
                    {username}
                  </span>
                )}
              </Link>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Deconectare
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Autentificare
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Înregistrare
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-secondary hover:bg-slate-100 hover:text-text-primary md:hidden"
          aria-label={mobileMenuOpen ? 'Închide meniul' : 'Deschide meniul'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
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
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-surface px-4 pb-4 pt-3 md:hidden">
          <nav aria-label="Navigare mobil" className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            {isAuthenticated ? (
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout?.();
                }}
              >
                Deconectare
              </Button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth>
                    Autentificare
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>
                    Înregistrare
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
