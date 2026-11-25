import { Card } from '../components/common';

function AboutPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-text-primary">
          Despre GameShelf
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Aplicație web pentru gestionarea bibliotecii personale de jocuri
          video, dezvoltată de echipa CBBFL.
        </p>
      </div>

      <Card padding="lg">
        <p className="text-sm leading-relaxed text-text-secondary">
          GameShelf îți permite să organizezi jocurile pe statusuri (Playing,
          Completed, Backlog, Dropped, Wishlist), să acorzi note și recenzii
          personale și să urmărești statistici despre colecția ta.
        </p>
      </Card>
    </section>
  );
}

export default AboutPage;
