import { Link } from 'react-router-dom';

function LibraryPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-surface border border-border rounded-xl p-8 max-w-lg w-full text-center">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Biblioteca mea
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Pagina principală a bibliotecii (/library) — urmează implementarea în
          SCRUM-150.
        </p>
        <nav className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
          <Link to="/search" className="text-primary hover:underline">
            Căutare
          </Link>
          <Link to="/profile" className="text-primary hover:underline">
            Profil
          </Link>
          <Link to="/about" className="text-primary hover:underline">
            Despre
          </Link>
        </nav>
      </div>
    </main>
  );
}

export default LibraryPage;
