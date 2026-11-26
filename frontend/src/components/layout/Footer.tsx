import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-text-secondary sm:flex-row sm:px-6 lg:px-8">
        <p>© 2026 GameShelf — Echipa CBBFL</p>
        <div className="flex items-center gap-5">
          <Link to="/library" className="hover:text-primary">
            Biblioteca mea
          </Link>
          <Link to="/search" className="hover:text-primary">
            Căutare jocuri
          </Link>
          <Link to="/about" className="hover:text-primary">
            Despre
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
