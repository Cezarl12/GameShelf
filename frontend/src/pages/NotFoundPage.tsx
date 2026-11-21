import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-surface border border-border rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="font-display text-4xl font-bold text-primary">404</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Pagina pe care o cauți nu există.
        </p>
        <Link
          to="/library"
          className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Înapoi la bibliotecă
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;
