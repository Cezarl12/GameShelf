import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '../components/common';

function LibraryPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Biblioteca mea
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Gestionează jocurile jucate, finalizate sau din backlog.
          </p>
        </div>
        <Link to="/search">
          <Button variant="primary">+ Adaugă joc</Button>
        </Link>
      </div>

      <Card padding="lg" className="text-center">
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          <Badge variant="primary">Playing</Badge>
          <Badge variant="success">Completed</Badge>
          <Badge variant="info">Backlog</Badge>
          <Badge variant="warning">Wishlist</Badge>
          <Badge variant="danger">Dropped</Badge>
        </div>
        <p className="text-sm text-text-secondary">
          Lista de jocuri și filtrele vor fi implementate în SCRUM-150.
        </p>
      </Card>
    </section>
  );
}

export default LibraryPage;
