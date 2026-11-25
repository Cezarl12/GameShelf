import { Card } from '../components/common';

function ProfilePage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary">
          Profil și statistici
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Datele contului și statisticile bibliotecii tale.
        </p>
      </div>

      <Card padding="lg" className="text-center">
        <p className="text-sm text-text-secondary">
          Pagina de profil (/profile) — urmează implementarea în SCRUM-154.
        </p>
      </Card>
    </section>
  );
}

export default ProfilePage;
