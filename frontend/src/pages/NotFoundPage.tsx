import { Link } from 'react-router-dom';
import { Button, Card } from '../components/common';

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md py-12">
      <Card padding="lg" className="text-center">
        <h1 className="font-display text-5xl font-bold text-primary">404</h1>
        <p className="mt-3 text-base font-medium text-text-primary">
          Pagina nu a fost găsită
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          Pagina pe care o cauți nu există sau a fost mutată.
        </p>
        <div className="mt-6">
          <Link to="/library">
            <Button variant="primary">Înapoi la bibliotecă</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default NotFoundPage;
