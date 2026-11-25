import { Card } from '../components/common';

function SearchPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary">
          Căutare jocuri
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Caută jocuri și adaugă-le în biblioteca ta personală.
        </p>
      </div>

      <Card padding="lg" className="text-center">
        <p className="text-sm text-text-secondary">
          Pagina de căutare (/search) — urmează implementarea în SCRUM-151.
        </p>
      </Card>
    </section>
  );
}

export default SearchPage;
