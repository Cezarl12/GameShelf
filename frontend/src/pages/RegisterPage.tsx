import { Card } from '../components/common';

function RegisterPage() {
  return (
    <div className="mx-auto max-w-md py-8">
      <Card padding="lg" className="text-center">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Înregistrare
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Pagina de înregistrare (/register) — urmează implementarea în
          SCRUM-149.
        </p>
      </Card>
    </div>
  );
}

export default RegisterPage;
